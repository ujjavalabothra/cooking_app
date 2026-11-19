# Fridge-to-Recipe App — MVP Plan

Nov 18, 2026 · @Ujjavala Bothra

## Overview

Build a mobile-first web app: snap your fridge, confirm what the AI sees, answer a few quick questions, and get 3 recipes you can cook right now. The goal is a working prototype in roughly 2 weeks of focused part-time work (estimate).

**Who it's for:** people who open a full fridge and still see "nothing to eat", plus anyone trying to hit a daily goal like protein.

**What makes it different:** a short per-meal check-in after every upload (time, chopping mood, nutrition goal), so the same fridge gives different answers on a lazy Tuesday vs a slow Sunday.

**MVP success criteria (targets, to validate with testers):**

- Under 30 seconds of waiting from photo to recipes.
- Testers correct no more than 2–3 detected ingredients per scan.
- At least 1 of the 3 recipes is something the tester would actually cook.
- Zero recipes containing a declared allergen across all test runs.

## Market scan

The snap-to-recipe loop is crowded, but almost every app sets filters once; few ask how you feel about *this* meal. That per-meal check-in is our wedge.

| App | How you input food | Pattern worth noting | Borrow for our MVP? |
| --- | --- | --- | --- |
| [SnapChef: AI Fridge Scanner](https://apps.apple.com/app/id6783267721) | Photo | Edit detected ingredients before generating; splits "cook now" vs "almost there" | Yes — both |
| [Scrappy AI](https://apps.apple.com/app/id6781905536) | Photo | Urgency labels push items to use first; data stays on device; explicit allergy disclaimer | Yes — use-it-up + disclaimer |
| [CookScope](https://apps.apple.com/app/id6759489206) | Photo | No account needed; filters by meal type, cuisine, time, diet | Yes — no login |
| [Recipez](https://apps.apple.com/us/app/id6765974915) | Photo | Exactly 3 recipes per scan, with cost and nutrition | Yes — 3 results |
| [Fridge Vision](https://apps.apple.com/us/app/id6751152490) | Up to 5 photos | Multi-photo scan for fridge + pantry | Yes — up to 3 photos |
| [SuperCook](https://apps.apple.com/app/id1477747816) | Manual list or voice | Matches a huge library of real web recipes; "missing one ingredient" filter | Later — real-recipe option |
| [Samsung Food](https://www.androidcentral.com/apps-software/samsung-food-app-launch) | Saved recipes, smart fridge | Converts recipes to vegan/vegetarian; shopping lists; ties to health data | Later |

**Common patterns:** confirm ingredients before generating, show 3–5 recipes (not 50), let people start without an account, charge for unlimited scans.

**Gaps we can fill:** effort ("am I in the mood to chop?") and "protein left for today" are rarely first-class inputs. Most apps also don't say *why* a recipe fits you; each of our cards will.

## Core user flow

There is no sign-up and no setup: the app opens straight to the camera, and every scan runs photo → review → check-in → recipes in about a minute.

&#91;embedded content: user flow · 8 steps, 2 loops\]

People can add another photo from the review step, or change their answers and reshuffle recipes from the results.

## Preference questions

Nothing is asked before the first scan. Long-term preferences start with sensible defaults and are learned along the way; only the per-meal check-in is asked, in 4 taps. Hard rules can never be broken; soft rules only rank recipes.

**Learned along the way (never asked up front; all editable in a settings sheet)**

| Preference | Default on first run | How it gets captured | Rule type |
| --- | --- | --- | --- |
| Allergies and diet | None | One extra card in the first check-in only: "Anything you can't eat?" with "Nothing" as a one-tap answer; remembered after | Hard |
| Pantry staples (oil, salt, spices, rice, pasta, eggs) | Assume common staples | Tap "I don't have this" on a recipe; saved for next time | — |
| Kitchen equipment | Stove, oven, microwave | Tap "I don't have this" on a recipe step, or settings | Hard |
| Dislikes | None | "Not for me" on a recipe card asks which ingredient; saved | Soft |
| Cooking skill | Comfortable | "Too fiddly" feedback nudges toward simpler recipes | Soft |
| Daily protein target | None | Asked once, optionally, the first time someone picks "High protein" | Soft |

**Per-meal check-in (after every upload)**

| Question | Options | Rule type | Effect on recipes |
| --- | --- | --- | --- |
| How much time do you have? | 10 / 20 / 30 / 45+ min | Hard | Caps total time |
| In the mood for chopping? | None / A little / Bring it on | Hard | Limits knife work and prep steps |
| Any nutrition goal for this meal? | High protein / Light / Balanced / No goal | Soft | Ranks recipes, shows macros |
| Anything to use up first? | Tap items from the detected list | Hard | Must include those items |
| Which meal is this? | Breakfast / Lunch / Dinner / Snack | Soft | Dish style |
| How many servings? | 1 / 2 / 4 | — | Scales quantities |
| What are you craving? | Comfort / Fresh / Spicy / Surprise me | Soft | Flavor direction |
| How much cleanup can you face? | One pan only / Don't care | Hard | Limits pots and pans |
| Strictly what's in the fridge? | Yes / OK to miss 1 item | Hard | Allows one missing ingredient |

**Recommendation:** ask the first 4 by default and tuck the rest behind "More options". The allergy card is the one exception to "no setup": it costs a single tap on the first run and is the app's main safety guard. Add "Same as last time" so repeat users can skip the check-in entirely.

## MVP scope

The MVP proves one thing: a photo plus a 4-tap check-in yields a recipe people actually cook. Everything else waits.

| In the MVP | Later (v2+) |
| --- | --- |
| Upload 1–3 photos (fridge, pantry, counter) | Barcode or grocery-receipt scanning |
| AI ingredient detection with an editable list | Pantry inventory that persists and tracks quantities |
| No setup: per-meal check-in, preferences learned along the way | Expiry-date tracking and reminders |
| 3 recipe cards, each with "why this fits you" | Weekly meal planning |
| Full recipe: ingredients, steps, time, estimated macros | Shopping lists and grocery ordering |
| "Show me different ones" regenerate button | Accounts, login, sync across devices |
| Save favorites and profile on the device | Ratings that learn your taste over time |
| Allergen double-check + disclaimer | Native iOS/Android apps, payments, social sharing |

## Tech approach

Ship a mobile web app with two server routes and one AI model — no database, no login, no app store. It opens in any phone browser and can be added to the home screen like an app.

&#91;embedded content: MVP architecture · 3 parts + 1 optional\]

| Layer | Quick-and-dirty pick | Why |
| --- | --- | --- |
| App | Next.js (React), mobile-first, installable as a PWA | One codebase for screens and server routes |
| Camera | A standard file input set to the rear camera | Works on iPhone and Android with no native code |
| Server | Next.js API routes | Keeps the AI key off the phone; runs the allergen check |
| AI | One vision-capable model (Claude Sonnet, GPT-4o class or Gemini) | Same model for detection and recipes |
| Storage | Browser local storage | Profile and favorites, no accounts needed |
| Hosting | Vercel free tier | Deploys from GitHub in minutes |

**Generated vs real recipes:** the MVP has the AI write recipes, which fits any fridge and every check-in answer. A recipe database like Spoonacular gives tested recipes but matches your constraints less tightly; keep it as a v2 option.

**Building with an AI app builder:** tools like Lovable, Bolt or v0 may pick their own stack (often React plus a hosted backend function). That's fine, as long as the AI key lives in the builder's secrets or environment settings, never in the app's front-end code. The handoff prompt below is ready to paste.

## AI prompt design

Two AI calls do all the work — one reads the photo, one writes the recipes — and both must return strict JSON so the app can render it.

**Call 1 — Detect ingredients (vision).** Input: the photos, resized to about 1024 px. Rules: list only what is visible, flag anything uncertain, and label opaque containers "unknown container" rather than guessing.

```json
{"ingredients": [
  {"name": "eggs", "category": "protein", "confidence": "high", "approx_amount": "6"},
  {"name": "spinach", "category": "vegetable", "confidence": "medium", "approx_amount": "half bag", "note": "looks wilted — use soon"}
]}
```

**Call 2 — Recommend recipes.** Input: confirmed ingredients, staples, profile, check-in answers, and the last 5 recipe titles (to avoid repeats). Output: 3 recipes, each with:

- `title`, `one_line_pitch`, `why_it_fits` (e.g. "20 min, no chopping, 38 g protein")
- `total_time_min`, `prep_effort` (none / light / heavy), `servings`
- `uses_from_fridge[]`, `uses_staples[]`, `missing[]` (empty unless "OK to miss 1")
- `macros_per_serving` (kcal, protein, carbs, fat — labeled as estimates)
- `steps[]` and `allergen_check` (the model states which allergens it ruled out)

**Allergy safety, in four layers:**

1. Allergies go in the system prompt as a hard rule that overrides everything else.
2. The app scans every recipe ingredient against the allergen list plus common hidden forms (e.g. peanut → satay, peanut oil; dairy → ghee, whey).
3. Any hit is dropped silently and the recipe regenerated.
4. Every recipe shows "Always check labels" — the app never claims a dish is allergen-free.

**Nutrition note:** model-estimated macros are rough. If protein tracking becomes central, v2 can compute macros from the free USDA FoodData Central database instead.

## Screens and design direction

Five screens and a settings sheet cover the whole MVP, with no onboarding. The look is a cozy cookbook: warm, homey and hand-made, not a fitness tracker.

1. **Home** — opens here on first launch: one big "Scan my fridge" button, plus saved recipes once there are some.
2. **Ingredient review** — detected items as chips grouped by category; low-confidence ones highlighted; tap to remove, "+" to add.
3. **Meal check-in** — one question per card, tappable chips, a progress dot row, "Same as last time" and "More options". The first run adds the "Anything you can't eat?" card.
4. **Recipe results** — 3 cards showing title, time, effort icon, protein, "uses 6 of your items", and the why-it-fits line.
5. **Recipe detail** — ingredients split into "from your fridge", "staples" and "missing"; numbered steps; estimated macros; save button; "I don't have this" on any staple.
6. **Settings sheet** (from a gear icon, never forced) — allergies, diet, staples, equipment, dislikes, protein target.

**Design direction: cozy cookbook.** It should feel like flipping through a well-loved family cookbook while staying fast and one-handed.

| Element | Direction |
| --- | --- |
| Background | Warm cream "paper" (around #FBF6EC), optional faint paper grain |
| Colors | Terracotta for main buttons, sage green for confirmations, butter yellow highlights, deep brown text instead of black |
| Type | Serif headings (Fraunces or Lora); clean sans body (Inter or Nunito); a handwritten font (Caveat) only for small notes like "why it fits" |
| Recipe cards | Index-card style: off-white, faint ruled lines, soft corners and shadow |
| Ingredient chips | Pantry-label tags with a small line icon per category |
| Illustrations | Simple hand-drawn line art (whisk, pan, herbs) for empty and loading states; no stock photos |
| Copy tone | Warm and homey: "Let's see what we've got", "Pull up a chair" |
| Layout | Mobile-first, large tap targets, chips instead of typing |

## Build plan

Test the AI prompts before writing any app code: if detection is poor on real fridges, nothing else matters. Day counts are rough estimates for one part-time builder.

1. **Days 1–2 — Prompt spike.** Run the detection prompt on 15–20 real fridge photos in an AI playground. Note what it misses or invents; tweak until misses are tolerable.
2. **Days 3–4 — Skeleton app.** Photo upload → detect → editable ingredient list, deployed live from day one.
3. **Days 5–6 — Profile and check-in.** Both screens, saved on the device.
4. **Days 7–8 — Recipes.** Recipe call, results cards, detail screen, allergen double-check.
5. **Days 9–10 — Polish.** Loading and error states, empty-fridge handling, styling.
6. **Days 11–14 — Test.** 5–10 friends cook from it; collect what they skipped, fixed or loved; iterate on prompts.

## Risks and mitigations

The biggest risk is detection quality; the most serious is an allergen slipping through.

| Risk | Why it matters | Mitigation |
| --- | --- | --- |
| Allergen slips into a recipe | Real harm, instant loss of trust | Four-layer check (see AI prompt design); never claim "allergen-free" |
| Missed or misread ingredients (door shelves, opaque tubs, items behind others) | Recipes built on food you don't have | Editable list, up to 3 photos, low-confidence items flagged |
| Unknown quantities | Recipe calls for 500 g chicken; you have 100 g | Ask "roughly how much?" for proteins only, or keep portions flexible |
| Macros are off | Protein-focused users stop trusting it | Label as estimates; v2 uses USDA data |
| Bland or broken recipes | AI invents odd combinations | Stick to common techniques in the prompt; thumbs up/down per recipe; real-recipe API as fallback |
| Question fatigue | People abandon before recipes appear | 4 questions max, "Same as last time", every question skippable |
| Slow responses or rising AI cost | Waits feel broken; bills creep up | Resize photos, show progress, set a monthly spend cap |
| Photo privacy | Fridge photos can reveal a lot | Don't store photos on the server; say so in the app |

## Handoff prompt for the AI app builder

Paste this as your first message, then build in two rounds: steps 1–5 first, then test detection on real fridge photos before asking for steps 6–9.

```text
Build a mobile-first web app called [APP NAME] that turns a photo of a fridge into 3 recipes the user can cook right now. No login, no database: store everything in the browser's local storage.

FLOW
1. No sign-up, no onboarding, no setup screens: the first launch opens straight to Home. Use these defaults until the user changes them: no allergies, no diet; equipment = stove, oven, microwave; skill = comfortable; pantry staples = oil, salt, pepper, common spices, rice, pasta, eggs, flour. All of these live in a settings sheet behind a gear icon that is never forced on the user.
2. Home: a large "Scan my fridge" button, plus the user's saved recipes once there are some.
3. Photo upload: 1 to 3 photos via a file input that opens the rear camera. Resize each photo to max 1024 px before sending.
4. Server function /api/detect: send the photos to a vision-capable AI model (e.g. Claude Sonnet). Prompt it to list only visible food, label opaque containers "unknown container", and return ONLY JSON: {"ingredients": [{"name", "category", "confidence": "high|medium|low", "approx_amount", "note"}]}.
5. Ingredient review: show ingredients as chips grouped by category. Highlight low-confidence chips. Tap a chip to remove it, "+" to add one, and an "Add another photo" button.
6. Meal check-in: one question per card with tappable chips and progress dots.
   - First check-in ONLY: "Anything you can't eat?" with allergy chips (nuts, peanuts, dairy, gluten, eggs, shellfish, fish, soy, sesame, other) and diet chips (vegetarian, vegan, pescatarian, halal, kosher), plus a one-tap "Nothing". Save the answer and never ask again.
   - Time available: 10 / 20 / 30 / 45+ min
   - In the mood for chopping? None / A little / Bring it on
   - Nutrition goal: High protein / Light / Balanced / No goal. The first time someone picks High protein, optionally ask for a daily protein target in grams (skippable) and save it.
   - Anything to use up first? (pick from the detected ingredients)
   - "More options": meal type, servings (1/2/4), craving (comfort, fresh, spicy, surprise me), cleanup (one pan only / don't care), strict fridge-only vs OK to miss 1 item
   - Buttons: "Same as last time" and "Skip"
7. Server function /api/recipes: send confirmed ingredients, staples, saved preferences, check-in answers and the last 5 recipe titles (to avoid repeats). Return ONLY JSON with exactly 3 recipes, each with: title, one_line_pitch, why_it_fits, total_time_min, prep_effort (none|light|heavy), servings, uses_from_fridge[], uses_staples[], missing[], macros_per_serving {kcal, protein_g, carbs_g, fat_g}, steps[], allergen_check.
8. Results: 3 index-card-style recipe cards showing title, time, effort icon, protein, "uses X of your items" and the why-it-fits line. Buttons: "Show different ones" and "Change answers". A "Not for me" link asks which ingredient the user dislikes and saves it.
9. Recipe detail: ingredients in three groups (From your fridge / Staples / Missing), numbered steps, macros labeled "estimate", a Save button, and the note "Always check labels for allergens." Each staple and equipment item has an "I don't have this" tap that updates the saved defaults and offers to regenerate.

HARD RULES
- Allergies, diet, equipment, time, chopping and cleanup answers are hard limits the AI must never break.
- After every /api/recipes response, check each ingredient in code against the user's allergens plus hidden forms (peanut: satay, peanut oil, groundnut; dairy: butter, ghee, cream, cheese, whey; gluten: wheat, flour, soy sauce, breadcrumbs; egg: mayonnaise; shellfish: shrimp paste, fish sauce). Drop and regenerate any recipe that matches.
- Keep the AI API key on the server only. Never store the photos.
- Show friendly error and empty states (blurry photo, nothing detected, AI timeout).

DESIGN: COZY COOKBOOK
Warm cream paper background (#FBF6EC), terracotta primary buttons, sage green confirmations, butter yellow highlights, deep brown text instead of black. Serif headings (Fraunces), sans body text (Inter), handwritten font (Caveat) only for the "why it fits" notes. Recipe cards look like index cards with faint ruled lines. Ingredient chips look like pantry labels with small line icons. Hand-drawn line-art illustrations for empty and loading states. Warm, homey copy ("Let's see what we've got"). Rotating playful loading messages while the AI works. Mobile-first, large tap targets, chips instead of typing.
```

**Tips for the builder session:**

- When it asks where to put the AI key, use its secrets or environment-variable feature.
- If a recipe breaks a rule, paste the bad output back and say which rule it broke; ask it to tighten the prompt.
- Ask for one change at a time once the app runs; big multi-change requests tend to break working parts.

## Open questions and to-dos

These decisions shape the build; the first three matter most.

**Decisions for you**

- [ ] Decided: phone web app first; native apps only if testers love it.
- [ ] Decided: an AI app builder builds it from the handoff prompt.
- [ ] AI-generated recipes only, or pull real recipes from a database where possible?
- [ ] Decided: cozy cookbook style. Still open: an app name to drop into the prompt.
- [ ] Which 4 check-in questions make the default cut?
- [ ] Who are the first 5–10 testers?

**To-dos before building**

- [ ] Take 15–20 photos of real fridges (yours, friends', messy and tidy) for the prompt spike.
- [ ] Get an AI provider API key and set a monthly spend cap.
- [ ] Write the allergen "hidden forms" list for the top allergens.
- [ ] Pick a name and grab the domain if you want one.

## Sources

App listings and articles opened via search on 18 Nov 2026: [SnapChef](https://apps.apple.com/app/id6783267721), [Scrappy AI](https://apps.apple.com/app/id6781905536), [CookScope](https://apps.apple.com/app/id6759489206), [Recipez](https://apps.apple.com/us/app/id6765974915), [Fridge Vision](https://apps.apple.com/us/app/id6751152490), [SuperCook](https://apps.apple.com/app/id1477747816), [Samsung Food launch (Android Central)](https://www.androidcentral.com/apps-software/samsung-food-app-launch).
