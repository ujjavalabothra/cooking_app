import React, { useState } from 'react';
import {
  ArrowLeft,
  Bookmark,
  Clock,
  ChefHat,
  Users,
  ShieldAlert,
  RefreshCw,
  Check,
} from 'lucide-react';
import { Recipe } from '../types';

interface RecipeDetailProps {
  recipe: Recipe;
  isSaved: boolean;
  canRegenerate: boolean;
  onToggleSave: (recipe: Recipe) => void;
  onDontHaveStaple: (stapleLine: string) => void;
  onDontHaveEquipment: (equipmentName: string) => void;
  onRegenerate: () => void;
  onBack: () => void;
}

const EFFORT_LABELS = {
  none: 'No chopping',
  light: 'Light prep',
  heavy: 'Full prep',
};

export function RecipeDetail({
  recipe,
  isSaved,
  canRegenerate,
  onToggleSave,
  onDontHaveStaple,
  onDontHaveEquipment,
  onRegenerate,
  onBack,
}: RecipeDetailProps) {
  const [checkedSteps, setCheckedSteps] = useState<Set<number>>(new Set());
  const [removedNotice, setRemovedNotice] = useState<string | null>(null);

  const toggleStep = (index: number) => {
    setCheckedSteps((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const handleMissingStaple = (line: string) => {
    onDontHaveStaple(line);
    setRemovedNotice(`Removed "${line}" from your default pantry staples.`);
  };

  const handleMissingEquipment = (eq: string) => {
    onDontHaveEquipment(eq);
    setRemovedNotice(`Removed "${eq}" from your kitchen equipment.`);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-16">
      {/* Top Row */}
      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={onBack}
          className="min-h-[44px] px-3 -ml-3 rounded-xl text-sm font-medium text-[#766257] hover:text-[#3A2A22] hover:bg-[#F3EBD9]/60 flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <button
          type="button"
          onClick={() => onToggleSave(recipe)}
          className={`min-h-[44px] px-4 rounded-xl border text-sm font-medium flex items-center gap-2 transition-colors cursor-pointer ${
            isSaved
              ? 'bg-[#E9F0E8] border-[#5C7A5B]/40 text-[#3A2A22]'
              : 'bg-[#FFFDF8] border-[#DFD2B8] text-[#3A2A22] hover:border-[#C85A32]'
          }`}
        >
          <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-[#5C7A5B] text-[#5C7A5B]' : ''}`} />
          <span>{isSaved ? 'Saved' : 'Save recipe'}</span>
        </button>
      </div>

      {/* Removed Staple / Equipment Notice with Regenerate CTA */}
      {removedNotice && (
        <div className="rounded-2xl bg-[#FDF5D8] border border-[#E6C55E] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <p className="text-sm text-[#3A2A22]">{removedNotice}</p>
          {canRegenerate && (
            <button
              type="button"
              onClick={onRegenerate}
              className="min-h-[40px] px-4 rounded-xl bg-[#C85A32] hover:bg-[#AD4924] text-white text-xs font-semibold flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Find new recipes</span>
            </button>
          )}
        </div>
      )}

      {/* Main Index Card */}
      <article className="index-card rounded-3xl border border-[#E8DEC8] p-6 sm:p-10 shadow-sm space-y-8">
        {/* Header */}
        <header className="space-y-3 border-b border-[#E8DEC8] pb-6">
          <h1 className="text-3xl sm:text-4xl font-semibold text-[#3A2A22] leading-tight">
            {recipe.title}
          </h1>
          <p className="text-base text-[#766257] leading-relaxed">{recipe.one_line_pitch}</p>
          <p
            className="text-2xl text-[#C85A32] leading-snug"
            style={{ fontFamily: 'var(--font-hand)' }}
          >
            &ldquo;{recipe.why_it_fits}&rdquo;
          </p>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 pt-2 text-sm text-[#766257] tabular-nums">
            <span className="inline-flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-[#5C7A5B]" />
              {recipe.total_time_min} min
            </span>
            <span aria-hidden="true">·</span>
            <span className="inline-flex items-center gap-1.5">
              <ChefHat className="w-4 h-4 text-[#5C7A5B]" />
              {EFFORT_LABELS[recipe.prep_effort]}
            </span>
            <span aria-hidden="true">·</span>
            <span className="inline-flex items-center gap-1.5">
              <Users className="w-4 h-4 text-[#5C7A5B]" />
              {recipe.servings} {recipe.servings === 1 ? 'serving' : 'servings'}
            </span>
          </div>
        </header>

        {/* Estimated Macros */}
        <section aria-label="Estimated nutrition per serving" className="space-y-2">
          <div className="flex items-baseline justify-between">
            <h2 className="text-lg font-semibold text-[#3A2A22]">Per serving</h2>
            <span className="text-xs text-[#766257]">Rough estimate</span>
          </div>
          <div className="grid grid-cols-4 gap-2 sm:gap-3">
            {[
              { label: 'Calories', value: `${recipe.macros_per_serving.kcal}`, unit: 'kcal' },
              { label: 'Protein', value: `${recipe.macros_per_serving.protein_g}g`, unit: 'est.' },
              { label: 'Carbs', value: `${recipe.macros_per_serving.carbs_g}g`, unit: 'est.' },
              { label: 'Fat', value: `${recipe.macros_per_serving.fat_g}g`, unit: 'est.' },
            ].map((m) => (
              <div
                key={m.label}
                className="rounded-2xl bg-[#FBF6EC] border border-[#E8DEC8] p-3 text-center"
              >
                <div className="font-serif text-lg sm:text-xl font-semibold text-[#3A2A22] tabular-nums">
                  {m.value}
                </div>
                <div className="text-[11px] text-[#766257] mt-0.5">{m.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Ingredients in 3 Groups */}
        <section className="space-y-5">
          <h2 className="text-2xl font-semibold text-[#3A2A22]">Ingredients</h2>

          {/* From your fridge */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-[#5C7A5B]">From your fridge</h3>
            <ul className="divide-y divide-[#E8DEC8]/70">
              {recipe.uses_from_fridge.map((item, idx) => (
                <li key={`fridge-${idx}`} className="py-2.5 text-sm sm:text-base text-[#3A2A22]">
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Pantry staples */}
          {recipe.uses_staples.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-[#766257]">Pantry staples</h3>
              <ul className="divide-y divide-[#E8DEC8]/70">
                {recipe.uses_staples.map((item, idx) => (
                  <li
                    key={`staple-${idx}`}
                    className="py-2 flex items-center justify-between gap-3 text-sm sm:text-base text-[#3A2A22]"
                  >
                    <span>{item}</span>
                    <button
                      type="button"
                      onClick={() => handleMissingStaple(item)}
                      className="min-h-[36px] px-2.5 rounded-lg text-xs font-medium text-[#766257] hover:text-[#C85A32] hover:bg-[#FBF6EC] shrink-0 transition-colors cursor-pointer"
                    >
                      I don&apos;t have this
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Missing (if allowed) */}
          {recipe.missing.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-[#C85A32]">Missing item</h3>
              <ul className="divide-y divide-[#E8DEC8]/70">
                {recipe.missing.map((item, idx) => (
                  <li key={`missing-${idx}`} className="py-2.5 text-sm sm:text-base text-[#3A2A22]">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Equipment */}
          {recipe.equipment_used && recipe.equipment_used.length > 0 && (
            <div className="space-y-2 pt-1">
              <h3 className="text-sm font-semibold text-[#766257]">Equipment</h3>
              <div className="flex flex-wrap gap-2">
                {recipe.equipment_used.map((eq) => (
                  <div
                    key={eq}
                    className="rounded-xl bg-[#FBF6EC] border border-[#E8DEC8] px-3 py-1.5 text-xs text-[#3A2A22] flex items-center gap-2"
                  >
                    <span className="capitalize font-medium">{eq}</span>
                    <button
                      type="button"
                      onClick={() => handleMissingEquipment(eq)}
                      className="text-[#766257] hover:text-[#C85A32] underline underline-offset-2 cursor-pointer"
                    >
                      I don&apos;t have this
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Numbered Steps */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-[#3A2A22]">Steps</h2>
          <ol className="space-y-3">
            {recipe.steps.map((step, idx) => {
              const done = checkedSteps.has(idx);
              return (
                <li key={idx}>
                  <button
                    type="button"
                    onClick={() => toggleStep(idx)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all flex items-start gap-3.5 cursor-pointer ${
                      done
                        ? 'bg-[#E9F0E8]/60 border-[#C6D8C4] text-[#766257]'
                        : 'bg-[#FBF6EC]/70 border-[#E8DEC8] text-[#3A2A22] hover:border-[#C85A32]/40'
                    }`}
                  >
                    <span
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 mt-0.5 tabular-nums ${
                        done
                          ? 'bg-[#5C7A5B] text-white'
                          : 'bg-[#FFFDF8] border border-[#DFD2B8] text-[#3A2A22]'
                      }`}
                    >
                      {done ? <Check className="w-4 h-4" /> : idx + 1}
                    </span>
                    <span className={`text-sm sm:text-base leading-relaxed ${done ? 'line-through' : ''}`}>
                      {step}
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        </section>

        {/* Permanent Allergen Disclaimer */}
        <footer className="rounded-2xl bg-[#FBF6EC] border border-[#E8DEC8] p-4 flex items-start gap-3 text-xs text-[#766257]">
          <ShieldAlert className="w-4 h-4 text-[#C85A32] shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold text-[#3A2A22]">Always check labels for allergens.</p>
            {recipe.allergen_check && <p>{recipe.allergen_check}</p>}
          </div>
        </footer>
      </article>
    </div>
  );
}
