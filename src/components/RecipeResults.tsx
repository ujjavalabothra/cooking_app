import React, { useState } from 'react';
import {
  Clock,
  ChefHat,
  RefreshCw,
  SlidersHorizontal,
  Bookmark,
  ThumbsDown,
  ChevronRight,
  Check,
} from 'lucide-react';
import { Recipe } from '../types';

interface RecipeResultsProps {
  recipes: Recipe[];
  savedRecipeIds: Set<string>;
  onSelectRecipe: (recipe: Recipe) => void;
  onToggleSave: (recipe: Recipe) => void;
  onRegenerate: () => void;
  onChangeAnswers: () => void;
  onAddDislike: (ingredient: string) => void;
}

const EFFORT_LABELS = {
  none: 'No chopping',
  light: 'Light prep',
  heavy: 'Full prep',
};

export function RecipeResults({
  recipes,
  savedRecipeIds,
  onSelectRecipe,
  onToggleSave,
  onRegenerate,
  onChangeAnswers,
  onAddDislike,
}: RecipeResultsProps) {
  const [dislikeRecipeId, setDislikeRecipeId] = useState<string | null>(null);
  const [recordedDislike, setRecordedDislike] = useState<string | null>(null);

  const handlePickDislike = (ingredient: string) => {
    onAddDislike(ingredient);
    setRecordedDislike(ingredient);
    setDislikeRecipeId(null);
    setTimeout(() => setRecordedDislike(null), 3500);
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-semibold text-[#3A2A22]">
            Three ideas for tonight
          </h1>
          <p className="text-sm text-[#766257]">
            Built from your fridge and tonight&apos;s check-in.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onChangeAnswers}
            className="min-h-[44px] px-4 rounded-xl bg-[#FFFDF8] hover:bg-[#F3EBD9] border border-[#DFD2B8] text-sm font-medium text-[#3A2A22] flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <SlidersHorizontal className="w-4 h-4 text-[#766257]" />
            <span>Change answers</span>
          </button>
          <button
            type="button"
            onClick={onRegenerate}
            className="min-h-[44px] px-4 rounded-xl bg-[#C85A32] hover:bg-[#AD4924] text-white text-sm font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Show different ones</span>
          </button>
        </div>
      </div>

      {recordedDislike && (
        <div className="rounded-2xl bg-[#E9F0E8] border border-[#C6D8C4] px-4 py-3 text-sm text-[#3A2A22] flex items-center gap-2">
          <Check className="w-4 h-4 text-[#5C7A5B]" />
          <span>
            Got it — we&apos;ll steer clear of <strong>{recordedDislike}</strong> next time.
          </span>
        </div>
      )}

      {/* 3 Index-Card Recipes */}
      <div className="grid gap-5 lg:grid-cols-3">
        {recipes.map((recipe) => {
          const isSaved = savedRecipeIds.has(recipe.id);
          const isPickingDislike = dislikeRecipeId === recipe.id;

          return (
            <article
              key={recipe.id}
              className="index-card rounded-3xl border border-[#E8DEC8] p-6 shadow-sm flex flex-col justify-between gap-5"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => onSelectRecipe(recipe)}
                    className="text-left font-serif text-2xl font-semibold text-[#3A2A22] hover:text-[#C85A32] transition-colors leading-snug cursor-pointer"
                  >
                    {recipe.title}
                  </button>
                  <button
                    type="button"
                    onClick={() => onToggleSave(recipe)}
                    aria-label={isSaved ? `Unsave ${recipe.title}` : `Save ${recipe.title}`}
                    className={`min-h-[44px] min-w-[44px] -mt-1 -mr-2 flex items-center justify-center rounded-xl transition-colors cursor-pointer shrink-0 ${
                      isSaved
                        ? 'text-[#5C7A5B]'
                        : 'text-[#9A877B] hover:text-[#3A2A22] hover:bg-[#FBF6EC]'
                    }`}
                  >
                    <Bookmark className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
                  </button>
                </div>

                {/* Unboxed metadata with middot separators */}
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[#766257] tabular-nums">
                  <span className="inline-flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {recipe.total_time_min} min
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="inline-flex items-center gap-1">
                    <ChefHat className="w-3.5 h-3.5" />
                    {EFFORT_LABELS[recipe.prep_effort]}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>~{recipe.macros_per_serving.protein_g}g protein</span>
                </div>

                <p className="text-sm text-[#3A2A22]/90 leading-relaxed">
                  {recipe.one_line_pitch}
                </p>

                <p className="text-xs font-medium text-[#5C7A5B]">
                  Uses {recipe.uses_from_fridge.length} of your fridge items
                  {recipe.missing.length > 0 ? ` · Missing ${recipe.missing.length}` : ''}
                </p>

                {/* Handwritten "why it fits" note */}
                <p
                  className="text-xl text-[#C85A32] leading-snug pt-1"
                  style={{ fontFamily: 'var(--font-hand)' }}
                >
                  &ldquo;{recipe.why_it_fits}&rdquo;
                </p>
              </div>

              <div className="space-y-3 pt-2 border-t border-[#E8DEC8]/80">
                <button
                  type="button"
                  onClick={() => onSelectRecipe(recipe)}
                  className="w-full min-h-[48px] rounded-2xl bg-[#3A2A22] hover:bg-[#2A1E18] text-[#FFFDF8] text-sm font-semibold px-4 flex items-center justify-between transition-colors cursor-pointer"
                >
                  <span>Cook this</span>
                  <ChevronRight className="w-4 h-4" />
                </button>

                {!isPickingDislike ? (
                  <button
                    type="button"
                    onClick={() => setDislikeRecipeId(recipe.id)}
                    className="w-full min-h-[40px] text-xs font-medium text-[#766257] hover:text-[#3A2A22] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <ThumbsDown className="w-3.5 h-3.5" />
                    <span>Not for me</span>
                  </button>
                ) : (
                  <div className="rounded-2xl bg-[#FBF6EC] border border-[#E8DEC8] p-3 space-y-2">
                    <p className="text-xs font-medium text-[#3A2A22]">
                      Which ingredient put you off?
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {recipe.uses_from_fridge.slice(0, 6).map((item) => (
                        <button
                          key={item}
                          type="button"
                          onClick={() => handlePickDislike(item)}
                          className="min-h-[36px] px-2.5 py-1 rounded-lg bg-[#FFFDF8] border border-[#DFD2B8] text-xs text-[#3A2A22] hover:border-[#C85A32] cursor-pointer"
                        >
                          {item}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => setDislikeRecipeId(null)}
                        className="min-h-[36px] px-2.5 py-1 text-xs text-[#766257] cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </div>

      <p className="text-xs text-center text-[#766257]">
        Macros are rough estimates. Always check ingredient labels for allergens.
      </p>
    </div>
  );
}
