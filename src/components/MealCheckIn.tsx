import React, { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import {
  ALLERGY_OPTIONS,
  ChoppingMood,
  CleanupMood,
  CravingType,
  DetectedIngredient,
  DIET_OPTIONS,
  MealCheckIn as MealCheckInType,
  MealType,
  NutritionGoal,
  UserProfile,
} from '../types';

interface MealCheckInProps {
  ingredients: DetectedIngredient[];
  profile: UserProfile;
  initialCheckIn: MealCheckInType;
  hasLastCheckIn: boolean;
  onUpdateProfile: (updater: (prev: UserProfile) => UserProfile) => void;
  onUseSameAsLastTime: () => void;
  onSubmit: (checkIn: MealCheckInType) => void;
  onBack: () => void;
}

type StepKey = 'allergy' | 'time' | 'chopping' | 'nutrition' | 'useUp';

export function MealCheckIn({
  ingredients,
  profile,
  initialCheckIn,
  hasLastCheckIn,
  onUpdateProfile,
  onUseSameAsLastTime,
  onSubmit,
  onBack,
}: MealCheckInProps) {
  const includeAllergyCard = !profile.hasCompletedAllergyCheck;
  const steps: StepKey[] = includeAllergyCard
    ? ['allergy', 'time', 'chopping', 'nutrition', 'useUp']
    : ['time', 'chopping', 'nutrition', 'useUp'];

  const [stepIndex, setStepIndex] = useState(0);
  const [checkIn, setCheckIn] = useState<MealCheckInType>(initialCheckIn);
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [customAllergy, setCustomAllergy] = useState('');
  const [showProteinPrompt, setShowProteinPrompt] = useState(false);
  const [proteinInput, setProteinInput] = useState(
    profile.dailyProteinTarget ? String(profile.dailyProteinTarget) : ''
  );

  const currentStep = steps[stepIndex];
  const isLastStep = stepIndex === steps.length - 1;

  const toggleAllergy = (item: string) => {
    onUpdateProfile((prev) => {
      const exists = prev.allergies.includes(item);
      return {
        ...prev,
        allergies: exists
          ? prev.allergies.filter((a) => a !== item)
          : [...prev.allergies, item],
      };
    });
  };

  const toggleDiet = (item: string) => {
    onUpdateProfile((prev) => {
      const exists = prev.diet.includes(item);
      return {
        ...prev,
        diet: exists ? prev.diet.filter((d) => d !== item) : [...prev.diet, item],
      };
    });
  };

  const addCustomAllergy = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = customAllergy.trim();
    if (!trimmed) return;
    onUpdateProfile((prev) => ({
      ...prev,
      allergies: prev.allergies.includes(trimmed)
        ? prev.allergies
        : [...prev.allergies, trimmed],
    }));
    setCustomAllergy('');
  };

  const handleCompleteAllergyStep = (noneSelected = false) => {
    onUpdateProfile((prev) => ({
      ...prev,
      allergies: noneSelected ? [] : prev.allergies,
      diet: noneSelected ? [] : prev.diet,
      hasCompletedAllergyCheck: true,
    }));
    setStepIndex((i) => Math.min(i + 1, steps.length - 1));
  };

  const handleSelectNutrition = (goal: NutritionGoal) => {
    setCheckIn((prev) => ({ ...prev, nutritionGoal: goal }));
    if (goal === 'high_protein' && !profile.hasAskedProteinTarget) {
      setShowProteinPrompt(true);
    } else {
      setShowProteinPrompt(false);
    }
  };

  const handleSaveProteinTarget = () => {
    const parsed = parseInt(proteinInput, 10);
    onUpdateProfile((prev) => ({
      ...prev,
      dailyProteinTarget: !Number.isNaN(parsed) && parsed > 0 ? parsed : prev.dailyProteinTarget,
      hasAskedProteinTarget: true,
    }));
    setShowProteinPrompt(false);
  };

  const toggleUseUpItem = (name: string) => {
    setCheckIn((prev) => {
      const exists = prev.useUpFirst.includes(name);
      return {
        ...prev,
        useUpFirst: exists
          ? prev.useUpFirst.filter((i) => i !== name)
          : [...prev.useUpFirst, name],
      };
    });
  };

  const handleNext = () => {
    if (currentStep === 'allergy') {
      handleCompleteAllergyStep(false);
      return;
    }
    if (currentStep === 'nutrition' && showProteinPrompt) {
      handleSaveProteinTarget();
    }
    if (isLastStep) {
      onSubmit(checkIn);
    } else {
      setStepIndex((i) => i + 1);
    }
  };

  const handlePrev = () => {
    if (stepIndex === 0) {
      onBack();
    } else {
      setStepIndex((i) => i - 1);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12">
      {/* Top Row: Back + Same as last time / Skip */}
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={handlePrev}
          className="min-h-[44px] px-3 -ml-3 rounded-xl text-sm font-medium text-[#766257] hover:text-[#3A2A22] hover:bg-[#F3EBD9]/60 flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <div className="flex items-center gap-2">
          {hasLastCheckIn && !includeAllergyCard && (
            <button
              type="button"
              onClick={onUseSameAsLastTime}
              className="min-h-[44px] px-3.5 rounded-xl bg-[#E9F0E8] hover:bg-[#DCE7DA] text-[#3A2A22] text-xs sm:text-sm font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#5C7A5B]" />
              <span>Same as last time</span>
            </button>
          )}
          {currentStep !== 'allergy' && (
            <button
              type="button"
              onClick={() => onSubmit(checkIn)}
              className="min-h-[44px] px-3 rounded-xl text-sm font-medium text-[#766257] hover:text-[#3A2A22] transition-colors cursor-pointer"
            >
              Skip
            </button>
          )}
        </div>
      </div>

      {/* Progress Dots */}
      <div className="flex items-center justify-center gap-2" aria-label={`Step ${stepIndex + 1} of ${steps.length}`}>
        {steps.map((s, idx) => (
          <button
            key={s}
            type="button"
            onClick={() => {
              if (s !== 'allergy' || includeAllergyCard) setStepIndex(idx);
            }}
            aria-label={`Go to step ${idx + 1}`}
            className={`h-2.5 rounded-full transition-all cursor-pointer ${
              idx === stepIndex
                ? 'w-8 bg-[#C85A32]'
                : idx < stepIndex
                  ? 'w-2.5 bg-[#5C7A5B]'
                  : 'w-2.5 bg-[#DFD2B8]'
            }`}
          />
        ))}
      </div>

      {/* Question Card */}
      <div className="index-card rounded-3xl border border-[#E8DEC8] p-6 sm:p-8 shadow-sm space-y-6">
        {currentStep === 'allergy' && (
          <div className="space-y-5">
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-[#5C7A5B]">Asked once · Saved for next time</p>
              <h1 className="text-2xl sm:text-3xl font-semibold text-[#3A2A22]">
                Anything you can&apos;t eat?
              </h1>
              <p className="text-sm text-[#766257]">
                We&apos;ll double-check every recipe against these—even hidden ingredients.
              </p>
            </div>

            <button
              type="button"
              onClick={() => handleCompleteAllergyStep(true)}
              className="w-full min-h-[48px] rounded-2xl bg-[#E9F0E8] hover:bg-[#DCE7DA] border border-[#C6D8C4] text-[#3A2A22] font-semibold text-sm transition-colors cursor-pointer"
            >
              Nothing — I eat everything
            </button>

            <div className="space-y-2.5">
              <p className="text-xs font-semibold text-[#766257]">Allergies</p>
              <div className="flex flex-wrap gap-2">
                {ALLERGY_OPTIONS.map((item) => {
                  const active = profile.allergies.includes(item);
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => toggleAllergy(item)}
                      className={`min-h-[44px] px-4 rounded-xl border text-sm font-medium transition-colors cursor-pointer ${
                        active
                          ? 'bg-[#C85A32] border-[#C85A32] text-white'
                          : 'bg-[#FBF6EC] border-[#DFD2B8] text-[#3A2A22] hover:border-[#C85A32]/60'
                      }`}
                    >
                      {item}
                    </button>
                  );
                })}
              </div>
              <form onSubmit={addCustomAllergy} className="flex gap-2 pt-1">
                <input
                  type="text"
                  value={customAllergy}
                  onChange={(e) => setCustomAllergy(e.target.value)}
                  placeholder="Other allergy (e.g. mustard, celery)..."
                  className="flex-1 min-h-[44px] rounded-xl bg-[#FBF6EC] border border-[#DFD2B8] px-3.5 text-sm text-[#3A2A22] placeholder:text-[#9A877B] focus:outline-none focus:border-[#C85A32]"
                />
                <button
                  type="submit"
                  className="min-h-[44px] px-4 rounded-xl bg-[#F3EBD9] hover:bg-[#E8DEC8] text-sm font-medium text-[#3A2A22] cursor-pointer"
                >
                  Add
                </button>
              </form>
            </div>

            <div className="space-y-2.5">
              <p className="text-xs font-semibold text-[#766257]">Diet</p>
              <div className="flex flex-wrap gap-2">
                {DIET_OPTIONS.map((item) => {
                  const active = profile.diet.includes(item);
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => toggleDiet(item)}
                      className={`min-h-[44px] px-4 rounded-xl border text-sm font-medium transition-colors cursor-pointer ${
                        active
                          ? 'bg-[#5C7A5B] border-[#5C7A5B] text-white'
                          : 'bg-[#FBF6EC] border-[#DFD2B8] text-[#3A2A22] hover:border-[#5C7A5B]/60'
                      }`}
                    >
                      {item}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {currentStep === 'time' && (
          <div className="space-y-5">
            <div className="space-y-1.5">
              <h1 className="text-2xl sm:text-3xl font-semibold text-[#3A2A22]">
                How much time do you have?
              </h1>
              <p className="text-sm text-[#766257]">
                We&apos;ll keep total prep and cooking inside your window.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {(
                [
                  { val: 10, label: '10 min', sub: 'Super quick' },
                  { val: 20, label: '20 min', sub: 'Weeknight pace' },
                  { val: 30, label: '30 min', sub: 'Unhurried' },
                  { val: 45, label: '45+ min', sub: 'Slow & cozy' },
                ] as const
              ).map((opt) => {
                const active = checkIn.timeMin === opt.val;
                return (
                  <button
                    key={opt.val}
                    type="button"
                    onClick={() => setCheckIn((p) => ({ ...p, timeMin: opt.val }))}
                    className={`min-h-[72px] p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                      active
                        ? 'bg-[#C85A32] border-[#C85A32] text-white shadow-sm'
                        : 'bg-[#FBF6EC] border-[#DFD2B8] text-[#3A2A22] hover:border-[#C85A32]/60'
                    }`}
                  >
                    <div className="font-serif text-xl font-semibold tabular-nums">{opt.label}</div>
                    <div className={`text-xs mt-0.5 ${active ? 'text-white/85' : 'text-[#766257]'}`}>
                      {opt.sub}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {currentStep === 'chopping' && (
          <div className="space-y-5">
            <div className="space-y-1.5">
              <h1 className="text-2xl sm:text-3xl font-semibold text-[#3A2A22]">
                In the mood for chopping?
              </h1>
              <p className="text-sm text-[#766257]">
                Be honest—we&apos;ll match the knife work to your energy.
              </p>
            </div>
            <div className="grid gap-3">
              {(
                [
                  { val: 'none', label: 'None', sub: 'No cutting board tonight—just assemble, toss, or heat' },
                  { val: 'little', label: 'A little', sub: 'A quick slice or two is fine' },
                  { val: 'bring_it_on', label: 'Bring it on', sub: 'Happy to dice, mince, and prep' },
                ] as Array<{ val: ChoppingMood; label: string; sub: string }>
              ).map((opt) => {
                const active = checkIn.chopping === opt.val;
                return (
                  <button
                    key={opt.val}
                    type="button"
                    onClick={() => setCheckIn((p) => ({ ...p, chopping: opt.val }))}
                    className={`min-h-[64px] p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                      active
                        ? 'bg-[#C85A32] border-[#C85A32] text-white shadow-sm'
                        : 'bg-[#FBF6EC] border-[#DFD2B8] text-[#3A2A22] hover:border-[#C85A32]/60'
                    }`}
                  >
                    <div className="font-semibold text-base">{opt.label}</div>
                    <div className={`text-xs mt-0.5 ${active ? 'text-white/85' : 'text-[#766257]'}`}>
                      {opt.sub}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {currentStep === 'nutrition' && (
          <div className="space-y-5">
            <div className="space-y-1.5">
              <h1 className="text-2xl sm:text-3xl font-semibold text-[#3A2A22]">
                Any nutrition goal for this meal?
              </h1>
              <p className="text-sm text-[#766257]">
                Helps us rank dishes and highlight estimated macros.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {(
                [
                  { val: 'high_protein', label: 'High protein', sub: 'Protein-forward' },
                  { val: 'light', label: 'Light', sub: 'Fresh & easy' },
                  { val: 'balanced', label: 'Balanced', sub: 'Well-rounded' },
                  { val: 'none', label: 'No goal', sub: 'Just tasty' },
                ] as Array<{ val: NutritionGoal; label: string; sub: string }>
              ).map((opt) => {
                const active = checkIn.nutritionGoal === opt.val;
                return (
                  <button
                    key={opt.val}
                    type="button"
                    onClick={() => handleSelectNutrition(opt.val)}
                    className={`min-h-[72px] p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                      active
                        ? 'bg-[#C85A32] border-[#C85A32] text-white shadow-sm'
                        : 'bg-[#FBF6EC] border-[#DFD2B8] text-[#3A2A22] hover:border-[#C85A32]/60'
                    }`}
                  >
                    <div className="font-semibold text-base">{opt.label}</div>
                    <div className={`text-xs mt-0.5 ${active ? 'text-white/85' : 'text-[#766257]'}`}>
                      {opt.sub}
                    </div>
                  </button>
                );
              })}
            </div>

            {showProteinPrompt && (
              <div className="rounded-2xl bg-[#FDF5D8] border border-[#E6C55E] p-4 space-y-3">
                <p className="text-sm font-medium text-[#3A2A22]">
                  Want to save a daily protein target? (Optional)
                </p>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min={20}
                    max={400}
                    value={proteinInput}
                    onChange={(e) => setProteinInput(e.target.value)}
                    placeholder="e.g. 120 g"
                    className="flex-1 min-h-[44px] rounded-xl bg-[#FFFDF8] border border-[#DFD2B8] px-3.5 text-sm text-[#3A2A22] tabular-nums focus:outline-none focus:border-[#C85A32]"
                  />
                  <button
                    type="button"
                    onClick={handleSaveProteinTarget}
                    className="min-h-[44px] px-4 rounded-xl bg-[#5C7A5B] text-white text-sm font-medium cursor-pointer"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onUpdateProfile((p) => ({ ...p, hasAskedProteinTarget: true }));
                      setShowProteinPrompt(false);
                    }}
                    className="min-h-[44px] px-3 rounded-xl text-sm text-[#766257] hover:text-[#3A2A22] cursor-pointer"
                  >
                    Skip
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {currentStep === 'useUp' && (
          <div className="space-y-5">
            <div className="space-y-1.5">
              <h1 className="text-2xl sm:text-3xl font-semibold text-[#3A2A22]">
                Anything to use up first?
              </h1>
              <p className="text-sm text-[#766257]">
                Tap any items you want to prioritize—we&apos;ll make sure they&apos;re in the recipes.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {ingredients.map((item) => {
                const selected = checkIn.useUpFirst.includes(item.name);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => toggleUseUpItem(item.name)}
                    className={`min-h-[44px] px-3.5 py-2 rounded-xl border text-sm font-medium transition-all cursor-pointer ${
                      selected
                        ? 'bg-[#F3D578] border-[#D4AE3D] text-[#3A2A22] shadow-xs'
                        : 'bg-[#FBF6EC] border-[#DFD2B8] text-[#3A2A22] hover:border-[#C85A32]/60'
                    }`}
                  >
                    {item.name}
                    {item.note ? (
                      <span className="text-xs text-[#766257] font-normal"> · {item.note}</span>
                    ) : null}
                  </button>
                );
              })}
            </div>

            {/* Expandable More Options */}
            <div className="pt-2 border-t border-[#E8DEC8]">
              <button
                type="button"
                onClick={() => setShowMoreOptions((prev) => !prev)}
                className="min-h-[44px] w-full flex items-center justify-between text-sm font-medium text-[#766257] hover:text-[#3A2A22] cursor-pointer"
              >
                <span>More options (servings, craving, cleanup, meal type)</span>
                {showMoreOptions ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>

              {showMoreOptions && (
                <div className="pt-4 space-y-5">
                  {/* Servings */}
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-[#766257]">How many servings?</p>
                    <div className="flex gap-2">
                      {([1, 2, 4] as const).map((n) => (
                        <button
                          key={n}
                          type="button"
                          onClick={() => setCheckIn((p) => ({ ...p, servings: n }))}
                          className={`min-h-[44px] flex-1 rounded-xl border text-sm font-medium tabular-nums cursor-pointer ${
                            checkIn.servings === n
                              ? 'bg-[#C85A32] border-[#C85A32] text-white'
                              : 'bg-[#FBF6EC] border-[#DFD2B8] text-[#3A2A22]'
                          }`}
                        >
                          {n}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Meal type */}
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-[#766257]">Which meal is this?</p>
                    <div className="flex flex-wrap gap-2">
                      {(
                        [
                          { val: 'any', label: 'Any' },
                          { val: 'breakfast', label: 'Breakfast' },
                          { val: 'lunch', label: 'Lunch' },
                          { val: 'dinner', label: 'Dinner' },
                          { val: 'snack', label: 'Snack' },
                        ] as Array<{ val: MealType; label: string }>
                      ).map((opt) => (
                        <button
                          key={opt.val}
                          type="button"
                          onClick={() => setCheckIn((p) => ({ ...p, mealType: opt.val }))}
                          className={`min-h-[40px] px-3.5 rounded-xl border text-sm font-medium cursor-pointer ${
                            checkIn.mealType === opt.val
                              ? 'bg-[#C85A32] border-[#C85A32] text-white'
                              : 'bg-[#FBF6EC] border-[#DFD2B8] text-[#3A2A22]'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Craving */}
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-[#766257]">What are you craving?</p>
                    <div className="flex flex-wrap gap-2">
                      {(
                        [
                          { val: 'comfort', label: 'Comfort' },
                          { val: 'fresh', label: 'Fresh' },
                          { val: 'spicy', label: 'Spicy' },
                          { val: 'surprise', label: 'Surprise me' },
                        ] as Array<{ val: CravingType; label: string }>
                      ).map((opt) => (
                        <button
                          key={opt.val}
                          type="button"
                          onClick={() => setCheckIn((p) => ({ ...p, craving: opt.val }))}
                          className={`min-h-[40px] px-3.5 rounded-xl border text-sm font-medium cursor-pointer ${
                            checkIn.craving === opt.val
                              ? 'bg-[#C85A32] border-[#C85A32] text-white'
                              : 'bg-[#FBF6EC] border-[#DFD2B8] text-[#3A2A22]'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Cleanup */}
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-[#766257]">How much cleanup can you face?</p>
                    <div className="grid grid-cols-2 gap-2">
                      {(
                        [
                          { val: 'one_pan', label: 'One pan only' },
                          { val: 'dont_care', label: "Don't care" },
                        ] as Array<{ val: CleanupMood; label: string }>
                      ).map((opt) => (
                        <button
                          key={opt.val}
                          type="button"
                          onClick={() => setCheckIn((p) => ({ ...p, cleanup: opt.val }))}
                          className={`min-h-[44px] px-3.5 rounded-xl border text-sm font-medium cursor-pointer ${
                            checkIn.cleanup === opt.val
                              ? 'bg-[#C85A32] border-[#C85A32] text-white'
                              : 'bg-[#FBF6EC] border-[#DFD2B8] text-[#3A2A22]'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Strictness */}
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-[#766257]">Strictly what&apos;s in the fridge?</p>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setCheckIn((p) => ({ ...p, strictFridgeOnly: true }))}
                        className={`min-h-[44px] px-3.5 rounded-xl border text-sm font-medium cursor-pointer ${
                          checkIn.strictFridgeOnly
                            ? 'bg-[#C85A32] border-[#C85A32] text-white'
                            : 'bg-[#FBF6EC] border-[#DFD2B8] text-[#3A2A22]'
                        }`}
                      >
                        Yes, fridge only
                      </button>
                      <button
                        type="button"
                        onClick={() => setCheckIn((p) => ({ ...p, strictFridgeOnly: false }))}
                        className={`min-h-[44px] px-3.5 rounded-xl border text-sm font-medium cursor-pointer ${
                          !checkIn.strictFridgeOnly
                            ? 'bg-[#C85A32] border-[#C85A32] text-white'
                            : 'bg-[#FBF6EC] border-[#DFD2B8] text-[#3A2A22]'
                        }`}
                      >
                        OK to miss 1 item
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Primary Step Button */}
        <div className="pt-2">
          <button
            type="button"
            onClick={handleNext}
            className="w-full min-h-[52px] rounded-2xl bg-[#C85A32] hover:bg-[#AD4924] active:scale-[0.99] text-white font-semibold text-base shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            {isLastStep ? (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Show me 3 recipes</span>
              </>
            ) : (
              <>
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
