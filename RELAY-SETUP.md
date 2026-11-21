# FuelTrack relay: one-time setup (about 10 minutes, free)

**Why you need it:** Groq, Mistral and Cloudflare AI refuse requests that come straight from a web app (the browser blocks them for security reasons). This small Cloudflare Worker passes the requests on. It also runs Cloudflare's own vision model, which needs no API key, and helps with barcode lookups.

Gemini, OpenRouter and Claude work without the relay. The relay just adds three more free fallbacks.

## 1. Create the Worker
1. Sign up or log in at **dash.cloudflare.com**. The free plan is enough.
2. Open **Workers & Pages** and choose **Create**, then create a Worker from the "Hello World" starter.
3. Name it `fueltrack-relay` and click **Deploy**.
4. Click **Edit code**, delete everything, and paste in the whole content of `relay/worker.js` (from your FuelTrack folder or the GitHub repository). Click **Deploy**.

## 2. Turn on Cloudflare AI (free vision model, no key)
1. In the Worker, open **Settings → Bindings → Add → Workers AI**.
2. Set the variable name to **`AI`** (capital letters), then save and deploy.

## 3. Set a relay password
1. Open **Settings → Variables and Secrets → Add**.
2. Choose type **Secret**, name **`RELAY_KEY`**, and enter any password you like. Save and deploy.

With a password set, nobody else can use your relay, even if they find its address.

## 4. Accept Meta's Llama licence (one time)
Cloudflare's free vision model is Meta's Llama 3.2. Before its first use, Meta's licence has to be accepted once. Open this address in Safari:

```
https://fueltrack-relay.<your-subdomain>.workers.dev/agree?key=<your password>
```

It should answer `{"ok":true,...}`.

## 5. Get the free API keys
- **Groq:** console.groq.com → API Keys → Create (starts with `gsk_`).
- **Mistral:** console.mistral.ai → choose the free **Experiment** plan (phone verification) → API keys.

## 6. Connect the app
In FuelTrack, open **More → 🛰 Relay**:
- **Relay URL:** `https://fueltrack-relay.<your-subdomain>.workers.dev`
- **Relay password:** your `RELAY_KEY`

Tap **Test relay**. It should say "✅ Relay works · Cloudflare AI ready".

Then add the Groq and Mistral keys, either under **More → Food recognition AI** (tap each service) or all at once with your keys file (**More → 🔑 Keys file**).

## Notes
- The Cloudflare dashboard changes its menus from time to time. If a label above doesn't match exactly, look for the closest one (Bindings / Variables and Secrets).
- If you'd rather not keep keys on the phone, add `GROQ_KEY` and `MISTRAL_KEY` as Worker secrets too. The relay uses them whenever the app sends no key. (The app currently still asks for a key, so you can enter any placeholder text such as `relay`.)
- The free Workers plan allows 100,000 requests a day, far more than FuelTrack uses.
