import React, { useEffect, useState } from 'react';
import { Settings } from 'lucide-react';
import {
  DEFAULT_CHECK_IN,
  DetectedIngredient,
  IngredientCategory,
  MealCheckIn as MealCheckInType,
  Recipe,
  UserProfile,
} from './types';
import {
  loadLastCheckIn,
  loadProfile,
  loadRecentTitles,
  loadSavedRecipes,
  pushRecentTitles,
  saveLastCheckIn,
  saveProfile,
  saveSavedRecipes,
} from './utils/storage';
import { resizeImageFile } from './utils/imageResize';
import { HomeView } from './components/HomeView';
import { IngredientReview } from './components/IngredientReview';
import { MealCheckIn } from './components/MealCheckIn';
import { RecipeResults } from './components/RecipeResults';
import { RecipeDetail } from './components/RecipeDetail';
import { SettingsSheet } from './components/SettingsSheet';
import { WhiskIllustration } from './components/Illustrations';

type Screen = 'home' | 'review' | 'checkin' | 'results' | 'detail';
type LoadingMode = null | 'detecting' | 'cooking';

const DETECT_MESSAGES = [
  'Peeking into the fridge…',
  'Checking what’s crisp in the crisper…',
  'Spotting jars and containers…',
  'Jotting down your ingredients…',
];

const RECIPE_MESSAGES = [
  'Flipping through the recipe box…',
  'Matching your mood and clock…',
  'Double-checking every ingredient…',
  'Putting three cozy ideas together…',
];

export default function App() {
  const [screen, setScreen] = useState<Screen>('home');
  const [detailOrigin, setDetailOrigin] = useState<'home' | 'results'>('results');
  const [loading, setLoading] = useState<LoadingMode>(null);
  const [loadingMsgIndex, setLoadingMsgIndex] = useState(0);
  const [isAddingPhoto, setIsAddingPhoto] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const [profile, setProfile] = useState<UserProfile>(() => loadProfile());
  const [savedRecipes, setSavedRecipes] = useState<Recipe[]>(() => loadSavedRecipes());
  const [lastCheckIn, setLastCheckIn] = useState<MealCheckInType | null>(() => loadLastCheckIn());

  const [photoCount, setPhotoCount] = useState(0);
  const [ingredients, setIngredients] = useState<DetectedIngredient[]>([]);
  const [currentCheckIn, setCurrentCheckIn] = useState<MealCheckInType>(
    () => loadLastCheckIn() || DEFAULT_CHECK_IN
  );
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  // Rotate warm loading messages while AI works
  useEffect(() => {
    if (!loading) return;
    setLoadingMsgIndex(0);
    const interval = setInterval(() => {
      setLoadingMsgIndex((i) => i + 1);
    }, 2400);
    return () => clearInterval(interval);
  }, [loading]);

  const updateProfile = (updater: (prev: UserProfile) => UserProfile) => {
    setProfile((prev) => {
      const next = updater(prev);
      saveProfile(next);
      return next;
    });
  };

  const handleToggleSaveRecipe = (recipe: Recipe) => {
    setSavedRecipes((prev) => {
      const exists = prev.some((r) => r.id === recipe.id);
      const next = exists
        ? prev.filter((r) => r.id !== recipe.id)
        : [{ ...recipe, savedAt: new Date().toISOString() }, ...prev];
      saveSavedRecipes(next);
      return next;
    });
  };

  const handleRemoveSavedRecipe = (id: string) => {
    setSavedRecipes((prev) => {
      const next = prev.filter((r) => r.id !== id);
      saveSavedRecipes(next);
      return next;
    });
  };

  const handlePhotosSelected = async (fileList: FileList) => {
    setError(null);
    const files = Array.from(fileList).slice(0, 3);
    if (files.length === 0) return;

    setLoading('detecting');
    try {
      const resized = await Promise.all(files.map(resizeImageFile));
      const res = await fetch('/api/detect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          photos: resized.map((p) => ({ mimeType: p.mimeType, data: p.data })),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Could not inspect that photo. Please try again.');
      }

      const detected: DetectedIngredient[] = data.ingredients || [];
      setPhotoCount(resized.length);
      setIngredients(detected);

      if (detected.length === 0) {
        setError(
          'That photo was a bit hard to read—I didn’t spot clear ingredients. You can add items manually below or try another photo.'
        );
      }
      setScreen('review');
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : 'Something went wrong while reading your photo. Please try again.'
      );
    } finally {
      setLoading(null);
    }
  };

  const handleAddAnotherPhoto = async (fileList: FileList) => {
    const remaining = Math.max(0, 3 - photoCount);
    const files = Array.from(fileList).slice(0, remaining);
    if (files.length === 0) return;

    setIsAddingPhoto(true);
    setError(null);
    try {
      const resized = await Promise.all(files.map(resizeImageFile));
      const res = await fetch('/api/detect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          photos: resized.map((p) => ({ mimeType: p.mimeType, data: p.data })),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Could not inspect the extra photo.');
      }

      const newItems: DetectedIngredient[] = data.ingredients || [];
      setIngredients((prev) => {
        const existingNames = new Set(prev.map((i) => i.name.toLowerCase()));
        const uniqueNew = newItems.filter((i) => !existingNames.has(i.name.toLowerCase()));
        return [...prev, ...uniqueNew];
      });
      setPhotoCount((c) => Math.min(3, c + resized.length));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Could not scan that photo.');
    } finally {
      setIsAddingPhoto(false);
    }
  };

  const handleRemoveIngredient = (id: string) => {
    setIngredients((prev) => prev.filter((i) => i.id !== id));
  };

  const handleAddIngredient = (name: string, category: IngredientCategory) => {
    const item: DetectedIngredient = {
      id: `manual-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name,
      category,
      confidence: 'high',
    };
    setIngredients((prev) => [item, ...prev]);
  };

  const fetchRecipes = async (checkInToUse: MealCheckInType, profileOverride?: UserProfile) => {
    setError(null);
    setLoading('cooking');
    setCurrentCheckIn(checkInToUse);
    setLastCheckIn(checkInToUse);
    saveLastCheckIn(checkInToUse);

    try {
      const recentTitles = loadRecentTitles();
      const res = await fetch('/api/recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ingredients,
          profile: profileOverride || profile,
          checkIn: checkInToUse,
          recentTitles,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Could not generate recipes right now. Please try again.');
      }

      const generated: Recipe[] = data.recipes || [];
      if (generated.length === 0) {
        throw new Error('No recipes came back. Try relaxing a filter or adding an ingredient.');
      }

      pushRecentTitles(generated.map((r) => r.title));
      setRecipes(generated);
      setScreen('results');
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : 'The kitchen timed out. Please try again in a moment.'
      );
    } finally {
      setLoading(null);
    }
  };

  const handleDontHaveStaple = (stapleLine: string) => {
    const lowerLine = stapleLine.toLowerCase();
    updateProfile((prev) => ({
      ...prev,
      staples: prev.staples.filter((s) => !lowerLine.includes(s.toLowerCase())),
    }));
  };

  const handleDontHaveEquipment = (equipmentName: string) => {
    const lowerEq = equipmentName.toLowerCase();
    updateProfile((prev) => ({
      ...prev,
      equipment: prev.equipment.filter((e) => e.toLowerCase() !== lowerEq),
    }));
  };

  const handleAddDislike = (ingredient: string) => {
    updateProfile((prev) => {
      if (prev.dislikes.some((d) => d.toLowerCase() === ingredient.toLowerCase())) {
        return prev;
      }
      return {
        ...prev,
        dislikes: [...prev.dislikes, ingredient],
      };
    });
  };

  const savedRecipeIds = new Set(savedRecipes.map((r) => r.id));

  const activeLoadingMessage =
    loading === 'detecting'
      ? DETECT_MESSAGES[loadingMsgIndex % DETECT_MESSAGES.length]
      : RECIPE_MESSAGES[loadingMsgIndex % RECIPE_MESSAGES.length];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Compact Sticky Top Bar */}
      <header className="sticky top-0 z-30 bg-[#FBF6EC]/90 backdrop-blur-md border-b border-[#E8DEC8]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => {
              setError(null);
              setScreen('home');
            }}
            className="font-serif text-xl font-bold tracking-tight text-[#3A2A22] whitespace-nowrap shrink-0 cursor-pointer"
          >
            What&apos;s Cooking
          </button>

          <button
            type="button"
            onClick={() => setSettingsOpen(true)}
            aria-label="Open kitchen preferences"
            className="min-h-[44px] min-w-[44px] -mr-2 flex items-center justify-center rounded-xl text-[#766257] hover:text-[#3A2A22] hover:bg-[#F3EBD9]/70 transition-colors cursor-pointer"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 pt-6 sm:pt-8">
        {loading ? (
          <div className="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-5 px-4">
            <div className="animate-bounce">
              <WhiskIllustration className="w-24 h-24" />
            </div>
            <div className="space-y-2">
              <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-[#3A2A22]">
                {activeLoadingMessage}
              </h2>
              <p className="text-sm text-[#766257]">
                {loading === 'detecting'
                  ? 'Usually takes just a few seconds.'
                  : 'Tailoring three recipes to your fridge and preferences.'}
              </p>
            </div>
          </div>
        ) : (
          <>
            {error && screen !== 'home' && (
              <div
                role="alert"
                className="mb-6 rounded-2xl bg-[#FDF5D8] border border-[#E6C55E] px-4 py-3 text-sm text-[#3A2A22]"
              >
                {error}
              </div>
            )}

            {screen === 'home' && (
              <HomeView
                savedRecipes={savedRecipes}
                onPhotosSelected={handlePhotosSelected}
                onOpenSavedRecipe={(recipe) => {
                  setSelectedRecipe(recipe);
                  setDetailOrigin('home');
                  setScreen('detail');
                }}
                onRemoveSavedRecipe={handleRemoveSavedRecipe}
                error={error}
              />
            )}

            {screen === 'review' && (
              <IngredientReview
                ingredients={ingredients}
                photoCount={photoCount}
                isAddingPhoto={isAddingPhoto}
                onRemoveIngredient={handleRemoveIngredient}
                onAddIngredient={handleAddIngredient}
                onAddAnotherPhoto={handleAddAnotherPhoto}
                onContinue={() => {
                  setError(null);
                  setScreen('checkin');
                }}
                onBack={() => {
                  setError(null);
                  setScreen('home');
                }}
              />
            )}

            {screen === 'checkin' && (
              <MealCheckIn
                ingredients={ingredients}
                profile={profile}
                initialCheckIn={currentCheckIn}
                hasLastCheckIn={lastCheckIn !== null}
                onUpdateProfile={updateProfile}
                onUseSameAsLastTime={() => {
                  if (lastCheckIn) {
                    fetchRecipes({ ...lastCheckIn, useUpFirst: [] });
                  }
                }}
                onSubmit={(checkIn) => fetchRecipes(checkIn)}
                onBack={() => setScreen('review')}
              />
            )}

            {screen === 'results' && (
              <RecipeResults
                recipes={recipes}
                savedRecipeIds={savedRecipeIds}
                onSelectRecipe={(recipe) => {
                  setSelectedRecipe(recipe);
                  setDetailOrigin('results');
                  setScreen('detail');
                }}
                onToggleSave={handleToggleSaveRecipe}
                onRegenerate={() => fetchRecipes(currentCheckIn)}
                onChangeAnswers={() => setScreen('checkin')}
                onAddDislike={handleAddDislike}
              />
            )}

            {screen === 'detail' && selectedRecipe && (
              <RecipeDetail
                recipe={selectedRecipe}
                isSaved={savedRecipeIds.has(selectedRecipe.id)}
                canRegenerate={ingredients.length > 0}
                onToggleSave={handleToggleSaveRecipe}
                onDontHaveStaple={handleDontHaveStaple}
                onDontHaveEquipment={handleDontHaveEquipment}
                onRegenerate={() => fetchRecipes(currentCheckIn)}
                onBack={() => setScreen(detailOrigin)}
              />
            )}
          </>
        )}
      </main>

      {/* Settings Bottom Sheet / Modal */}
      <SettingsSheet
        isOpen={settingsOpen}
        profile={profile}
        onClose={() => setSettingsOpen(false)}
        onUpdateProfile={updateProfile}
      />
    </div>
  );
}
