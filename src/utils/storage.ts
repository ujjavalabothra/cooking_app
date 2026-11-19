import {
  DEFAULT_CHECK_IN,
  DEFAULT_PROFILE,
  MealCheckIn,
  Recipe,
  UserProfile,
} from '../types';

const KEYS = {
  PROFILE: 'whats_cooking_profile_v1',
  LAST_CHECK_IN: 'whats_cooking_last_checkin_v1',
  SAVED_RECIPES: 'whats_cooking_saved_recipes_v1',
  RECENT_TITLES: 'whats_cooking_recent_titles_v1',
};

export function loadProfile(): UserProfile {
  try {
    const raw = localStorage.getItem(KEYS.PROFILE);
    if (!raw) return { ...DEFAULT_PROFILE };
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_PROFILE,
      ...parsed,
    };
  } catch {
    return { ...DEFAULT_PROFILE };
  }
}

export function saveProfile(profile: UserProfile): void {
  try {
    localStorage.setItem(KEYS.PROFILE, JSON.stringify(profile));
  } catch {
    // Ignore storage quota errors
  }
}

export function loadLastCheckIn(): MealCheckIn | null {
  try {
    const raw = localStorage.getItem(KEYS.LAST_CHECK_IN);
    if (!raw) return null;
    return { ...DEFAULT_CHECK_IN, ...JSON.parse(raw) };
  } catch {
    return null;
  }
}

export function saveLastCheckIn(checkIn: MealCheckIn): void {
  try {
    localStorage.setItem(KEYS.LAST_CHECK_IN, JSON.stringify(checkIn));
  } catch {
    // Ignore storage quota errors
  }
}

export function loadSavedRecipes(): Recipe[] {
  try {
    const raw = localStorage.getItem(KEYS.SAVED_RECIPES);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveSavedRecipes(recipes: Recipe[]): void {
  try {
    localStorage.setItem(KEYS.SAVED_RECIPES, JSON.stringify(recipes));
  } catch {
    // Ignore storage quota errors
  }
}

export function loadRecentTitles(): string[] {
  try {
    const raw = localStorage.getItem(KEYS.RECENT_TITLES);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.slice(0, 5) : [];
  } catch {
    return [];
  }
}

export function pushRecentTitles(newTitles: string[]): string[] {
  const existing = loadRecentTitles();
  const merged = [...newTitles, ...existing].filter(
    (title, index, arr) => arr.findIndex((t) => t.toLowerCase() === title.toLowerCase()) === index
  );
  const trimmed = merged.slice(0, 5);
  try {
    localStorage.setItem(KEYS.RECENT_TITLES, JSON.stringify(trimmed));
  } catch {
    // Ignore
  }
  return trimmed;
}
