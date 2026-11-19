import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type, ThinkingLevel } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const PRIMARY_MODEL = 'gemini-4-hydrogen';
const FALLBACK_MODEL = 'gemini-3.1-flash-lite';

function getAiClient(): GoogleGenAI {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured on the server.');
  }
  return new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function isTransientHighDemandError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return (
    msg.includes('503') ||
    msg.includes('UNAVAILABLE') ||
    msg.toLowerCase().includes('high demand') ||
    msg.toLowerCase().includes('overloaded')
  );
}

async function generateWithRetry(
  ai: GoogleGenAI,
  params: Omit<Parameters<GoogleGenAI['models']['generateContent']>[0], 'model'>
) {
  const modelsToTry = [PRIMARY_MODEL, PRIMARY_MODEL, FALLBACK_MODEL];
  let lastError: unknown;

  for (let i = 0; i < modelsToTry.length; i++) {
    const model = modelsToTry[i];
    try {
      const config =
        model === FALLBACK_MODEL && params.config
          ? { ...params.config, thinkingConfig: undefined }
          : params.config;

      return await ai.models.generateContent({
        ...params,
        model,
        config,
      });
    } catch (err) {
      lastError = err;
      if (!isTransientHighDemandError(err) || i === modelsToTry.length - 1) {
        throw err;
      }
      const delayMs = i === 0 ? 1200 : 2000;
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  throw lastError;
}

// Hidden allergen forms dictionary for deterministic Layer 2 safety checks
const HIDDEN_ALLERGEN_FORMS: Record<string, string[]> = {
  peanuts: ['peanut', 'peanuts', 'satay', 'peanut oil', 'groundnut', 'arachis', 'peanut butter'],
  peanut: ['peanut', 'peanuts', 'satay', 'peanut oil', 'groundnut', 'arachis', 'peanut butter'],
  nuts: [
    'almond', 'walnut', 'cashew', 'pecan', 'pistachio', 'hazelnut', 'macadamia',
    'pine nut', 'brazil nut', 'pesto', 'marzipan', 'praline', 'nutella', 'nut butter', 'tree nut',
  ],
  dairy: [
    'milk', 'butter', 'ghee', 'cream', 'cheese', 'whey', 'casein', 'yogurt', 'yoghurt',
    'kefir', 'paneer', 'ricotta', 'mozzarella', 'parmesan', 'cheddar', 'feta', 'brie',
    'sour cream', 'buttermilk', 'half-and-half', 'creme fraiche', 'mascarpone', 'ice cream',
  ],
  gluten: [
    'wheat', 'flour', 'all-purpose flour', 'bread flour', 'soy sauce', 'breadcrumbs',
    'panko', 'pasta', 'spaghetti', 'penne', 'macaroni', 'noodles', 'bread', 'tortilla',
    'couscous', 'barley', 'rye', 'seitan', 'malt', 'udon', 'ramen', 'croutons', 'farro', 'bulgur',
  ],
  eggs: ['egg', 'eggs', 'mayonnaise', 'mayo', 'aioli', 'meringue', 'custard', 'hollandaise', 'frittata', 'omelette'],
  egg: ['egg', 'eggs', 'mayonnaise', 'mayo', 'aioli', 'meringue', 'custard', 'hollandaise', 'frittata', 'omelette'],
  shellfish: [
    'shrimp', 'prawn', 'crab', 'lobster', 'scallop', 'clam', 'mussel', 'oyster',
    'shrimp paste', 'fish sauce', 'crayfish', 'langoustine', 'krill', 'calamari', 'squid',
  ],
  fish: [
    'fish', 'salmon', 'tuna', 'cod', 'anchovy', 'anchovies', 'sardine', 'mackerel',
    'trout', 'tilapia', 'halibut', 'bass', 'fish sauce', 'worcestershire', 'bonito', 'dashi',
  ],
  soy: ['soy', 'soya', 'tofu', 'tempeh', 'edamame', 'miso', 'tamari', 'soy sauce', 'teriyaki', 'hoisin'],
  sesame: ['sesame', 'tahini', 'halvah', 'gomashio', 'sesame oil', 'sesame seed'],
};

interface RecipeCandidate {
  title: string;
  one_line_pitch: string;
  why_it_fits: string;
  total_time_min: number;
  prep_effort: 'none' | 'light' | 'heavy';
  servings: number;
  uses_from_fridge: string[];
  uses_staples: string[];
  missing: string[];
  equipment_used: string[];
  macros_per_serving: {
    kcal: number;
    protein_g: number;
    carbs_g: number;
    fat_g: number;
  };
  steps: string[];
  allergen_check: string;
}

function findAllergenViolation(recipe: RecipeCandidate, allergies: string[]): string | null {
  if (!allergies || allergies.length === 0) return null;

  const haystack = [
    recipe.title,
    ...(recipe.uses_from_fridge || []),
    ...(recipe.uses_staples || []),
    ...(recipe.missing || []),
    ...(recipe.steps || []),
  ]
    .join(' ')
    .toLowerCase();

  for (const rawAllergen of allergies) {
    const allergen = rawAllergen.trim().toLowerCase();
    if (!allergen) continue;

    const terms = new Set<string>([allergen, ...(HIDDEN_ALLERGEN_FORMS[allergen] || [])]);
    for (const term of terms) {
      // Escape regex special characters and match whole word or phrase
      const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`\\b${escaped}s?\\b`, 'i');
      if (regex.test(haystack)) {
        // Guard against false positives like "gluten-free" or "dairy-free" or "egg-free"
        const freeRegex = new RegExp(`\\b${escaped}[\\s-]free\\b`, 'i');
        const cleaned = haystack.replace(freeRegex, '');
        if (regex.test(cleaned)) {
          return `${rawAllergen} (matched "${term}")`;
        }
      }
    }
  }

  return null;
}

const DETECT_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    ingredients: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING, description: 'Concise ingredient name in lowercase' },
          category: {
            type: Type.STRING,
            enum: ['protein', 'vegetable', 'fruit', 'dairy', 'pantry', 'other'],
          },
          confidence: {
            type: Type.STRING,
            enum: ['high', 'medium', 'low'],
          },
          approx_amount: {
            type: Type.STRING,
            description: 'Rough visible quantity like "6", "half bag", "1 bunch"',
          },
          note: {
            type: Type.STRING,
            description: 'Optional short note, e.g., "looks wilted — use soon" or "opaque tub"',
          },
        },
        required: ['name', 'category', 'confidence'],
      },
    },
  },
  required: ['ingredients'],
};

const RECIPE_ITEM_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    one_line_pitch: { type: Type.STRING },
    why_it_fits: {
      type: Type.STRING,
      description: 'Short warm margin note like "20 min, no chopping, ~38g protein"',
    },
    total_time_min: { type: Type.INTEGER },
    prep_effort: { type: Type.STRING, enum: ['none', 'light', 'heavy'] },
    servings: { type: Type.INTEGER },
    uses_from_fridge: { type: Type.ARRAY, items: { type: Type.STRING } },
    uses_staples: { type: Type.ARRAY, items: { type: Type.STRING } },
    missing: { type: Type.ARRAY, items: { type: Type.STRING } },
    equipment_used: { type: Type.ARRAY, items: { type: Type.STRING } },
    macros_per_serving: {
      type: Type.OBJECT,
      properties: {
        kcal: { type: Type.INTEGER },
        protein_g: { type: Type.INTEGER },
        carbs_g: { type: Type.INTEGER },
        fat_g: { type: Type.INTEGER },
      },
      required: ['kcal', 'protein_g', 'carbs_g', 'fat_g'],
    },
    steps: { type: Type.ARRAY, items: { type: Type.STRING } },
    allergen_check: {
      type: Type.STRING,
      description: 'Brief statement of which declared allergens were ruled out',
    },
  },
  required: [
    'title',
    'one_line_pitch',
    'why_it_fits',
    'total_time_min',
    'prep_effort',
    'servings',
    'uses_from_fridge',
    'uses_staples',
    'missing',
    'equipment_used',
    'macros_per_serving',
    'steps',
    'allergen_check',
  ],
};

const RECIPES_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    recipes: {
      type: Type.ARRAY,
      items: RECIPE_ITEM_SCHEMA,
    },
  },
  required: ['recipes'],
};

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '15mb' }));

  app.post('/api/detect', async (req, res) => {
    try {
      const { photos } = req.body as {
        photos?: Array<{ mimeType: string; data: string }>;
      };

      if (!photos || !Array.isArray(photos) || photos.length === 0) {
        return res.status(400).json({ error: 'Please upload at least one photo.' });
      }

      const ai = getAiClient();

      const parts = [
        ...photos.slice(0, 3).map((p) => ({
          inlineData: {
            mimeType: p.mimeType || 'image/jpeg',
            data: p.data,
          },
        })),
        {
          text: `Inspect these fridge/pantry/counter photos carefully.
Rules:
1. List ONLY food and ingredients that are clearly visible. Never invent items.
2. If you see an opaque container or covered bowl where you cannot tell what is inside, label it "unknown container" with confidence "low" and a short note.
3. Flag anything blurry, partially hidden, or uncertain with confidence "low" or "medium".
4. If produce looks wilted, bruised, or near expiry, add a short note like "looks wilted — use soon".
5. Deduplicate items if multiple photos show the same shelf.
6. If the photo is completely blurry or shows no food at all, return an empty ingredients array.`,
        },
      ];

      const response = await generateWithRetry(ai, {
        contents: { parts },
        config: {
          responseMimeType: 'application/json',
          responseSchema: DETECT_SCHEMA,
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        },
      });

      const raw = (response.text ?? '{"ingredients": []}').trim();
      const parsed = JSON.parse(raw) as { ingredients?: Array<Record<string, unknown>> };
      const ingredients = (parsed.ingredients || []).map((item, idx) => ({
        id: `ing-${Date.now()}-${idx}-${Math.random().toString(36).slice(2, 6)}`,
        name: String(item.name || '').trim(),
        category: item.category || 'other',
        confidence: item.confidence || 'medium',
        approx_amount: item.approx_amount ? String(item.approx_amount) : undefined,
        note: item.note ? String(item.note) : undefined,
      })).filter((i) => i.name.length > 0);

      return res.json({ ingredients });
    } catch (err: unknown) {
      console.error('Error in /api/detect:', err);
      const message = isTransientHighDemandError(err)
        ? 'The kitchen is a little busy right now—please tap Scan again in a moment.'
        : err instanceof Error
          ? err.message
          : 'Failed to inspect photo.';
      return res.status(500).json({ error: message });
    }
  });

  app.post('/api/recipes', async (req, res) => {
    try {
      const { ingredients, profile, checkIn, recentTitles = [] } = req.body;

      if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
        return res.status(400).json({ error: 'Please confirm at least one ingredient first.' });
      }

      const ai = getAiClient();
      const allergies: string[] = Array.isArray(profile?.allergies) ? profile.allergies : [];
      const diet: string[] = Array.isArray(profile?.diet) ? profile.diet : [];
      const staples: string[] = Array.isArray(profile?.staples) ? profile.staples : [];
      const equipment: string[] = Array.isArray(profile?.equipment) ? profile.equipment : ['stove', 'oven', 'microwave'];
      const dislikes: string[] = Array.isArray(profile?.dislikes) ? profile.dislikes : [];
      const skill: string = profile?.skill || 'comfortable';
      const dailyProteinTarget: number | undefined = profile?.dailyProteinTarget;

      const buildSystemInstruction = (extraWarning = '') => `You are a warm, practical home-cooking chef writing recipes for a cozy family cookbook.
HARD RULES THAT OVERRIDE EVERYTHING ELSE:
- NEVER include any declared allergen or any hidden form of it. Declared allergies: ${allergies.length > 0 ? allergies.join(', ') : 'None'}.
- STRICTLY follow declared diet: ${diet.length > 0 ? diet.join(', ') : 'None'}.
- ONLY use available kitchen equipment: ${equipment.join(', ')}.
- Total time MUST be <= ${checkIn?.timeMin || 30} minutes (if 45, 45+ minutes is fine).
- Chopping mood: ${
  checkIn?.chopping === 'none'
    ? 'NONE — zero knife work or chopping required'
    : checkIn?.chopping === 'little'
      ? 'A LITTLE — minimal, quick slicing/chopping only'
      : 'BRING IT ON — full prep is welcome'
}.
- Cleanup: ${checkIn?.cleanup === 'one_pan' ? 'ONE PAN / ONE POT ONLY' : 'Normal cleanup is fine'}.
- Strictness: ${checkIn?.strictFridgeOnly ? 'STRICTLY use only the confirmed fridge ingredients and listed pantry staples; missing[] MUST be empty.' : 'You may include at most 1 common missing ingredient in missing[] if it really elevates the dish.'}
- Must-use items (if any): ${(checkIn?.useUpFirst || []).length > 0 ? checkIn.useUpFirst.join(', ') : 'None'}.
${extraWarning ? `\nCRITICAL CORRECTION: ${extraWarning}` : ''}

SOFT PREFERENCES (rank and shape recipes accordingly):
- Nutrition goal: ${checkIn?.nutritionGoal || 'balanced'}${dailyProteinTarget ? ` (user daily protein target: ~${dailyProteinTarget}g)` : ''}
- Meal type: ${checkIn?.mealType && checkIn.mealType !== 'any' ? checkIn.mealType : 'any'}
- Servings: ${checkIn?.servings || 2}
- Craving: ${checkIn?.craving || 'surprise'}
- Cooking skill: ${skill}
- Avoid disliked ingredients: ${dislikes.length > 0 ? dislikes.join(', ') : 'None'}
- Avoid repeating these recent titles: ${recentTitles.length > 0 ? recentTitles.join('; ') : 'None'}

Stick to real, delicious, dependable home-cooking techniques—never invent bizarre combinations.
Include quantities in uses_from_fridge, uses_staples, and missing (e.g. "2 large eggs", "1 tbsp olive oil").
Make why_it_fits a short, warm, specific note (e.g., "18 min, zero chopping, ~34g protein").`;

      const ingredientSummary = ingredients
        .map((i: { name: string; approx_amount?: string; note?: string }) =>
          `${i.name}${i.approx_amount ? ` (${i.approx_amount})` : ''}${i.note ? ` [${i.note}]` : ''}`
        )
        .join(', ');

      const generateBatch = async (count: number, excludeTitles: string[], extraWarning = ''): Promise<RecipeCandidate[]> => {
        const prompt = `Confirmed fridge ingredients: ${ingredientSummary}
Available pantry staples: ${staples.length > 0 ? staples.join(', ') : 'None'}
${excludeTitles.length > 0 ? `Do NOT repeat these titles: ${excludeTitles.join('; ')}` : ''}

Generate exactly ${count} distinct, cookable recipes that follow every hard rule.`;

        const response = await generateWithRetry(ai, {
          contents: prompt,
          config: {
            systemInstruction: buildSystemInstruction(extraWarning),
            responseMimeType: 'application/json',
            responseSchema: RECIPES_SCHEMA,
            thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          },
        });

        const raw = (response.text ?? '{"recipes": []}').trim();
        const parsed = JSON.parse(raw) as { recipes?: RecipeCandidate[] };
        return parsed.recipes || [];
      };

      // Layer 2 & Layer 3: Scan every recipe for allergens + hidden forms, silently drop & regenerate
      const safeRecipes: RecipeCandidate[] = [];
      const seenTitles = new Set<string>(recentTitles.map((t: string) => t.toLowerCase()));
      let attempts = 0;
      let lastWarning = '';

      while (safeRecipes.length < 3 && attempts < 3) {
        attempts++;
        const needed = 3 - safeRecipes.length;
        const batch = await generateBatch(needed, Array.from(seenTitles), lastWarning);
        const rejectedReasons: string[] = [];

        for (const recipe of batch) {
          if (safeRecipes.length >= 3) break;
          const violation = findAllergenViolation(recipe, allergies);
          if (violation) {
            rejectedReasons.push(`"${recipe.title}" contained forbidden allergen: ${violation}`);
            continue;
          }
          if (seenTitles.has(recipe.title.toLowerCase())) {
            continue;
          }
          seenTitles.add(recipe.title.toLowerCase());
          safeRecipes.push(recipe);
        }

        if (rejectedReasons.length > 0) {
          lastWarning = `Previous draft was rejected for allergen safety: ${rejectedReasons.join('; ')}. Do NOT use those ingredients or hidden derivatives.`;
        }
      }

      if (safeRecipes.length === 0) {
        return res.status(422).json({
          error: 'We could not safely build recipes that match all your allergies and constraints with these ingredients. Try adding a few more items or relaxing a filter.',
        });
      }

      const recipesWithIds = safeRecipes.slice(0, 3).map((r, idx) => ({
        ...r,
        id: `rec-${Date.now()}-${idx}-${Math.random().toString(36).slice(2, 6)}`,
      }));

      return res.json({ recipes: recipesWithIds });
    } catch (err: unknown) {
      console.error('Error in /api/recipes:', err);
      const message = isTransientHighDemandError(err)
        ? 'The kitchen is a little busy right now—please try again in a moment.'
        : err instanceof Error
          ? err.message
          : 'Failed to generate recipes.';
      return res.status(500).json({ error: message });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`What's Cooking server running at http://localhost:${PORT}`);
  });
}

startServer();
