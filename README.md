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
- **Snap a meal**: take a photo, and it's saved with the entry.
  - Offline: you tap the foods on the plate and set portions.
  - Online, with a Google Gemini API key (More → AI photo recognition): AI identifies each item and estimates grams and calories. You can adjust each item (×0.5–×2) before adding it. Claude is available as an alternative provider.

## Set up Gemini (photo → calories)
1. Go to https://aistudio.google.com and sign in with your Google account.
2. Click **Get API key → Create API key** and copy it (it starts with `AIza…`).
3. In FuelTrack: **More → AI photo recognition → Google Gemini**, paste the key, then tap **Save** and **Test connection**.
4. Leave the model as `gemini-flash-latest`. This always uses Google's newest Flash model.

Tip: in Google AI Studio, restrict the key to the "Generative Language API" so it can't be used for anything else.
- Food diary: Breakfast, Lunch, Dinner and Snacks, with day navigation
- About 200 built-in foods, including Indian (dosa, idli, sambar, biryani…) and German (Brötchen, Brezel, Döner, Currywurst…)
- Search, recent foods, categories, serving or gram amounts
- Custom foods from nutrition labels, Quick-add calories
- Saved meals, copy a meal from yesterday, copy an entry to today
- Goal calculator: BMR/TDEE (Mifflin-St Jeor), weekly lose/maintain/gain rate, macro split
- Calories remaining = Goal − Food + Exercise, with macro progress bars
- Exercise log with MET-based calorie burn (or enter your watch's number)
- Water tracker, weight log with chart, daily notes, logging streak
- Progress: 7/14/30-day calorie chart, average macros, weight trend, 5-week projection
- Backup export/import (JSON), erase all data

## Updating
Change the files, drag the folder to Netlify again, and bump `CACHE` in `sw.js` (e.g. `fueltrack-v2`) so phones pick up the new version.
