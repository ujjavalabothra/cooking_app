export type IngredientCategory =
  | 'protein'
  | 'vegetable'
  | 'fruit'
  | 'dairy'
  | 'pantry'
  | 'other';

export type ConfidenceLevel = 'high' | 'medium' | 'low';

export interface DetectedIngredient {
  id: string;
  name: string;
  category: IngredientCategory;
  confidence: ConfidenceLevel;
  approx_amount?: string;
  note?: string;
}

export type PrepEffort = 'none' | 'light' | 'heavy';

export interface MacrosPerServing {
  kcal: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
}

export interface Recipe {
  id: string;
  title: string;
  one_line_pitch: string;
  why_it_fits: string;
  total_time_min: number;
  prep_effort: PrepEffort;
  servings: number;
  uses_from_fridge: string[];
  uses_staples: string[];
  missing: string[];
  equipment_used: string[];
  macros_per_serving: MacrosPerServing;
  steps: string[];
  allergen_check: string;
  savedAt?: string;
}

export type CookingSkill = 'beginner' | 'comfortable' | 'confident';

export interface UserProfile {
  allergies: string[];
  diet: string[];
  staples: string[];
  equipment: string[];
  dislikes: string[];
  skill: CookingSkill;
  dailyProteinTarget?: number;
  hasCompletedAllergyCheck: boolean;
  hasAskedProteinTarget: boolean;
}

export type ChoppingMood = 'none' | 'little' | 'bring_it_on';
export type NutritionGoal = 'high_protein' | 'light' | 'balanced' | 'none';
export type MealType = 'any' | 'breakfast' | 'lunch' | 'dinner' | 'snack';
export type CravingType = 'surprise' | 'comfort' | 'fresh' | 'spicy';
export type CleanupMood = 'one_pan' | 'dont_care';

export interface MealCheckIn {
  timeMin: 10 | 20 | 30 | 45;
  chopping: ChoppingMood;
  nutritionGoal: NutritionGoal;
  useUpFirst: string[];
  mealType: MealType;
  servings: 1 | 2 | 4;
  craving: CravingType;
  cleanup: CleanupMood;
  strictFridgeOnly: boolean;
}

export interface ResizedPhoto {
  mimeType: string;
  data: string; // base64 without data URL prefix
  previewUrl: string;
}

export const DEFAULT_PROFILE: UserProfile = {
  allergies: [],
  diet: [],
  staples: [
    'olive oil',
    'salt',
    'black pepper',
    'common spices',
    'rice',
    'pasta',
    'eggs',
    'flour',
  ],
  equipment: ['stove', 'oven', 'microwave'],
  dislikes: [],
  skill: 'comfortable',
  hasCompletedAllergyCheck: false,
  hasAskedProteinTarget: false,
};

export const DEFAULT_CHECK_IN: MealCheckIn = {
  timeMin: 20,
  chopping: 'little',
  nutritionGoal: 'balanced',
  useUpFirst: [],
  mealType: 'any',
  servings: 2,
  craving: 'surprise',
  cleanup: 'dont_care',
  strictFridgeOnly: true,
};

export const ALLERGY_OPTIONS = [
  'Nuts',
  'Peanuts',
  'Dairy',
  'Gluten',
  'Eggs',
  'Shellfish',
  'Fish',
  'Soy',
  'Sesame',
];

export const DIET_OPTIONS = [
  'Vegetarian',
  'Vegan',
  'Pescatarian',
  'Halal',
  'Kosher',
];

export const EQUIPMENT_OPTIONS = [
  'stove',
  'oven',
  'microwave',
  'air fryer',
  'blender',
  'rice cooker',
  'instant pot',
];
