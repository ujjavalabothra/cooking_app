import React, { useRef } from 'react';
import { Camera, Upload, Bookmark, Clock, ChevronRight, ShieldCheck } from 'lucide-react';
import { Recipe } from '../types';
import { SkilletIllustration, HerbSprigIllustration } from './Illustrations';

interface HomeViewProps {
  savedRecipes: Recipe[];
  onPhotosSelected: (files: FileList) => void;
  onOpenSavedRecipe: (recipe: Recipe) => void;
  onRemoveSavedRecipe: (id: string) => void;
  error: string | null;
}

export function HomeView({
  savedRecipes,
  onPhotosSelected,
  onOpenSavedRecipe,
  onRemoveSavedRecipe,
  error,
}: HomeViewProps) {
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const uploadInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onPhotosSelected(e.target.files);
      e.target.value = '';
    }
  };

  return (
    <div className="space-y-10 pb-12">
      {/* Hidden inputs for rear camera & gallery upload (up to 3 photos) */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        multiple
        onChange={handleFileChange}
        className="hidden"
        aria-label="Take a photo of your fridge"
      />
      <input
        ref={uploadInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileChange}
        className="hidden"
        aria-label="Upload up to 3 fridge photos"
      />

      {/* Hero / Primary Scan Card */}
      <section className="index-card rounded-3xl border border-[#E8DEC8] p-6 sm:p-10 shadow-sm">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-7 space-y-4">
            <p className="text-sm font-medium text-[#5C7A5B]">
              Pull up a chair
            </p>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-[#3A2A22] leading-[1.12]">
              Let&apos;s see what we&apos;ve got in the fridge.
            </h1>
            <p className="text-base text-[#766257] leading-relaxed max-w-xl">
              Snap 1 to 3 photos of your fridge, pantry, or counter. Answer four quick questions about tonight&apos;s mood, and get three recipes you can actually cook right now.
            </p>

            {error && (
              <div
                role="alert"
                className="rounded-2xl bg-[#FDF5D8] border border-[#E6C55E] px-4 py-3 text-sm text-[#3A2A22]"
              >
                {error}
              </div>
            )}

            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                className="min-h-[54px] px-7 py-3.5 rounded-2xl bg-[#C85A32] hover:bg-[#AD4924] active:scale-[0.99] text-white font-semibold text-base shadow-sm transition-all flex items-center justify-center gap-2.5 cursor-pointer"
              >
                <Camera className="w-5 h-5" />
                <span>Scan my fridge</span>
              </button>

              <button
                type="button"
                onClick={() => uploadInputRef.current?.click()}
                className="min-h-[54px] px-6 py-3.5 rounded-2xl bg-[#FBF6EC] hover:bg-[#F3EBD9] border border-[#DFD2B8] text-[#3A2A22] font-medium text-base transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Upload className="w-4 h-4 text-[#766257]" />
                <span>Upload 1–3 photos</span>
              </button>
            </div>

            <p className="text-xs text-[#766257] flex items-center gap-1.5 pt-1">
              <ShieldCheck className="w-4 h-4 text-[#5C7A5B] shrink-0" />
              <span>No account needed. Your photos are never stored—only your saved recipes stay on this device.</span>
            </p>
          </div>

          <div className="lg:col-span-5 flex flex-col items-center justify-center rounded-2xl bg-[#FBF6EC]/80 border border-[#E8DEC8] p-6 text-center">
            <SkilletIllustration className="w-28 h-28" />
            <p className="font-serif text-lg font-medium text-[#3A2A22] mt-3">
              Same fridge, different night
            </p>
            <p className="text-sm text-[#766257] mt-1 max-w-xs">
              10-minute no-chop Tuesday or a slow, cozy Sunday—we tailor all three dishes to how you feel right now.
            </p>
          </div>
        </div>
      </section>

      {/* Saved Recipes Shelf */}
      <section aria-labelledby="saved-heading" className="space-y-4">
        <div className="flex items-baseline justify-between gap-4">
          <h2 id="saved-heading" className="text-2xl font-semibold text-[#3A2A22]">
            Your Recipe Box
          </h2>
          {savedRecipes.length > 0 && (
            <span className="text-sm text-[#766257] tabular-nums">
              {savedRecipes.length} {savedRecipes.length === 1 ? 'saved' : 'saved'}
            </span>
          )}
        </div>

        {savedRecipes.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-[#DFD2B8] bg-[#FFFDF8]/60 p-8 text-center flex flex-col items-center">
            <HerbSprigIllustration className="w-16 h-16" />
            <p className="font-serif text-lg text-[#3A2A22] mt-2">
              Your recipe box is waiting for its first favorite
            </p>
            <p className="text-sm text-[#766257] mt-1 max-w-sm">
              When you find a dish you love, tap Save and it will live right here for easy weeknight repeats.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {savedRecipes.map((recipe) => (
              <div
                key={recipe.id}
                className="index-card rounded-2xl border border-[#E8DEC8] p-5 flex flex-col justify-between gap-4 hover:border-[#C85A32]/50 transition-colors"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => onOpenSavedRecipe(recipe)}
                      className="text-left font-serif text-xl font-semibold text-[#3A2A22] hover:text-[#C85A32] transition-colors cursor-pointer"
                    >
                      {recipe.title}
                    </button>
                    <button
                      type="button"
                      onClick={() => onRemoveSavedRecipe(recipe.id)}
                      aria-label={`Remove ${recipe.title} from saved recipes`}
                      className="min-h-[40px] min-w-[40px] -mt-1 -mr-1 flex items-center justify-center rounded-xl text-[#5C7A5B] hover:bg-[#FBF6EC] transition-colors cursor-pointer shrink-0"
                    >
                      <Bookmark className="w-5 h-5 fill-current" />
                    </button>
                  </div>

                  <p className="text-xs text-[#766257] tabular-nums flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 shrink-0" />
                    <span>{recipe.total_time_min} min</span>
                    <span aria-hidden="true">·</span>
                    <span>~{recipe.macros_per_serving.protein_g}g protein</span>
                    <span aria-hidden="true">·</span>
                    <span>{recipe.servings} srv</span>
                  </p>

                  <p
                    className="text-lg text-[#5C7A5B] leading-snug"
                    style={{ fontFamily: 'var(--font-hand)' }}
                  >
                    {recipe.why_it_fits}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => onOpenSavedRecipe(recipe)}
                  className="min-h-[44px] w-full rounded-xl bg-[#FBF6EC] hover:bg-[#F3EBD9] border border-[#E8DEC8] px-4 py-2 text-sm font-medium text-[#3A2A22] flex items-center justify-between transition-colors cursor-pointer"
                >
                  <span>Open recipe</span>
                  <ChevronRight className="w-4 h-4 text-[#766257]" />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
