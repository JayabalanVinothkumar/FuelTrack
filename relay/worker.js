// FuelTrack relay - a tiny Cloudflare Worker (free plan is plenty).
// It lets the FuelTrack web app reach services that refuse direct browser calls:
//   POST /v1/groq/chat/completions      -> Groq (OpenAI-compatible)
//   POST /v1/mistral/chat/completions   -> Mistral (OpenAI-compatible)
//   POST /v1/openrouter/chat/completions-> OpenRouter (optional)
//   POST /cfai                          -> Cloudflare Workers AI vision model (no key needed)
//   GET  /off/<barcode>                 -> Open Food Facts product lookup
//   GET  /ping                          -> health check
//   GET  /agree?key=<password>          -> one-time acceptance of Meta's Llama licence (needed by the Llama vision model)
// This file contains no secrets. Your relay password goes in the Worker's secret RELAY_KEY.

const ALLOWED_ORIGINS = [
  "https://jayabalanvinothkumar.github.io", // FuelTrack on GitHub Pages
];
const UPSTREAM = {
  groq: "https://api.groq.com/openai/v1",
  mistral: "https://api.mistral.ai/v1",
  openrouter: "https://openrouter.ai/api/v1",
};
const OFF_FIELDS = "code,product_name,product_name_en,product_name_de,brands,nutriments,serving_size,serving_quantity,quantity,product_quantity,product_quantity_unit,nutrition_data_per";

export default {
  async fetch(req, env) {
    const origin = req.headers.get("Origin") || "";
    const cors = {
      "Access-Control-Allow-Origin": ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0],
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
      "Access-Control-Allow-Headers": "content-type,authorization,x-relay-key",
      "Access-Control-Max-Age": "86400",
      "Vary": "Origin",
    };
    const json = (o, status = 200) =>
      new Response(JSON.stringify(o), { status, headers: { ...cors, "content-type": "application/json" } });

    if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });

    const url = new URL(req.url);
    const path = url.pathname.replace(/\/+$/, "") || "/";
    const given = req.headers.get("x-relay-key") || url.searchParams.get("key") || "";
    if (env.RELAY_KEY && given !== env.RELAY_KEY) return json({ error: "wrong relay password" }, 401);

    if (path === "/ping") return json({ ok: true, ai: !!env.AI });

    // One-time licence acceptance for Meta's Llama vision model (open this URL yourself once).
    if (path === "/agree") {
      if (!env.AI) return json({ error: "Workers AI binding 'AI' is missing" }, 500);
      const model = url.searchParams.get("model") || "@cf/meta/llama-3.2-11b-vision-instruct";
      try { await env.AI.run(model, { prompt: "agree" }); } catch (e) { /* already accepted -> fine */ }
      return json({ ok: true, accepted: model });
    }

    // Open Food Facts barcode lookup
    let m = path.match(/^\/off\/(\d{6,14})$/);
    if (m) {
      const r = await fetch(`https://world.openfoodfacts.org/api/v2/product/${m[1]}.json?fields=${OFF_FIELDS}`, {
        headers: { "User-Agent": "FuelTrack/2.0 (personal calorie app)" },
      });
      return new Response(r.body, {
        status: r.status,
        headers: { ...cors, "content-type": "application/json", "cache-control": "public, max-age=86400" },
      });
    }

    // Cloudflare Workers AI vision (uses the free daily allowance, no API key)
    if (path === "/cfai" && req.method === "POST") {
      if (!env.AI) return json({ error: "Workers AI binding 'AI' is missing - add it under Settings > Bindings" }, 500);
      const { model = "@cf/meta/llama-3.2-11b-vision-instruct", prompt = "", image } = await req.json();
      try {
        const out = await env.AI.run(model, { messages: [{ role: "user", content: prompt }], image, max_tokens: 1200 });
        return json({ text: out?.response ?? out?.result?.response ?? "" });
      } catch (e) {
        const msg = String(e?.message || e);
        if (/agree/i.test(msg)) return json({ error: "Open <your relay URL>/agree?key=<password> once to accept Meta's Llama licence" }, 403);
        return json({ error: msg }, /limit|quota|neuron|429|capacity/i.test(msg) ? 429 : 502);
      }
    }

    // OpenAI-compatible pass-through (your key travels in the Authorization header,
    // or set GROQ_KEY / MISTRAL_KEY / OPENROUTER_KEY as Worker secrets instead)
    m = path.match(/^\/v1\/(groq|mistral|openrouter)\/chat\/completions$/);
    if (m && req.method === "POST") {
      const p = m[1];
      let auth = req.headers.get("authorization") || "";
      const stored = env[p.toUpperCase() + "_KEY"];
      if (stored && (!/^Bearer\s+\S+/.test(auth) || /^Bearer\s+relay$/i.test(auth))) auth = "Bearer " + stored;
      const r = await fetch(`${UPSTREAM[p]}/chat/completions`, {
        method: "POST",
        headers: { "content-type": "application/json", authorization: auth },
        body: req.body,
      });
      return new Response(r.body, {
        status: r.status,
        headers: { ...cors, "content-type": r.headers.get("content-type") || "application/json" },
      });
    }

    return json({ error: "not found" }, 404);
  },
};
