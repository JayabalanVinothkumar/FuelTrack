# FuelTrack: offline calorie tracker for iPhone

## Install on your iPhone (one-time, about 5 minutes)
iPhone only runs web apps offline when they're opened from a web address, so the app needs to be hosted once:

1. On your PC, go to https://app.netlify.com/drop (free, no credit card needed) and drag this whole `FuelTrack` folder onto the page.
   (GitHub Pages also works if you prefer it.)
2. Netlify gives you a link like `https://something.netlify.app`. Open that link in **Safari** on your iPhone.
3. Tap **Share → Add to Home Screen → Add**.
4. Open FuelTrack from the home screen once while you're online. After that it works fully **offline**.

Your data stays on the phone and is never uploaded. Use **More → Backup → Export** now and then.

## Features (modelled on MyFitnessPal)
- **Snap a meal:** the photo is shrunk to 768 px (JPEG 75%) and sent to a **chain of AI services**, tried top to bottom:
  Groq → Mistral → Cloudflare AI → Gemini Flash-Lite → OpenRouter → Gemini Flash → Claude.
  If one is busy, out of free quota or returns nonsense, the next one answers within seconds. A service that just failed is skipped for a short while, so the next photo doesn't waste time on it. You can reorder the services or switch them on and off under **More → 🤖 Food recognition AI**.
- **Scan a barcode** for packaged food and drinks: a live camera scan, a photo of the barcode, or typing the number. Nutrition comes from **Open Food Facts** (free, exact label values per 100 g/ml). Scanned products are saved to My Foods, so they work offline afterwards. Products that aren't in the database are filled in once from the label and remembered.
- Check and correct the AI result: rename items, swap one for a food from the list, change the grams or ml.
- A food diary with about 280 foods, including about 120 South Indian / Tamil Nadu dishes (searchable by their Tamil names), Indian tea and coffee variants, and German foods.
- Goals (BMR/TDEE), macros, water, weight, exercise, progress charts, saved meals, photo saving, backup and restore.

## AI keys and the relay
- **Gemini, OpenRouter and Claude** work straight from the app.
- **Groq, Mistral and Cloudflare AI** need the free relay (a Cloudflare Worker). See **RELAY-SETUP.md**.
- Put all keys in your private `fueltrack-keys.txt`, then use **More → 🔑 Keys file**. Never upload that file to GitHub.

## Updating
Change the files, drag the folder to Netlify again, and bump `CACHE` in `sw.js` (e.g. `fueltrack-v2`) so phones pick up the new version.
