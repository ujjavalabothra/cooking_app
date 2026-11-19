import React, { useState } from 'react';
import { X, Plus } from 'lucide-react';
import {
  ALLERGY_OPTIONS,
  CookingSkill,
  DIET_OPTIONS,
  EQUIPMENT_OPTIONS,
  UserProfile,
} from '../types';

interface SettingsSheetProps {
  isOpen: boolean;
  profile: UserProfile;
  onClose: () => void;
  onUpdateProfile: (updater: (prev: UserProfile) => UserProfile) => void;
}

export function SettingsSheet({
  isOpen,
  profile,
  onClose,
  onUpdateProfile,
}: SettingsSheetProps) {
  const [newStaple, setNewStaple] = useState('');
  const [newDislike, setNewDislike] = useState('');
  const [newAllergy, setNewAllergy] = useState('');

  if (!isOpen) return null;

  const toggleItem = (
    field: 'allergies' | 'diet' | 'equipment',
    value: string
  ) => {
    onUpdateProfile((prev) => {
      const list = prev[field];
      const exists = list.includes(value);
      return {
        ...prev,
        [field]: exists ? list.filter((i) => i !== value) : [...list, value],
        ...(field === 'allergies' ? { hasCompletedAllergyCheck: true } : {}),
      };
    });
  };

  const addToList = (
    field: 'staples' | 'dislikes' | 'allergies',
    value: string,
    clear: () => void
  ) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    onUpdateProfile((prev) => {
      const list = prev[field];
      if (list.some((i) => i.toLowerCase() === trimmed.toLowerCase())) {
        return prev;
      }
      return {
        ...prev,
        [field]: [...list, trimmed],
        ...(field === 'allergies' ? { hasCompletedAllergyCheck: true } : {}),
      };
    });
    clear();
  };

  const removeFromList = (field: 'staples' | 'dislikes' | 'allergies', value: string) => {
    onUpdateProfile((prev) => ({
      ...prev,
      [field]: prev[field].filter((i) => i !== value),
    }));
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#3A2A22]/40 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-title"
    >
      <div className="w-full sm:max-w-xl max-h-[88vh] bg-[#FBF6EC] rounded-t-3xl sm:rounded-3xl border border-[#E8DEC8] shadow-xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-[#FFFDF8] border-b border-[#E8DEC8] flex items-center justify-between">
          <div>
            <h2 id="settings-title" className="text-xl font-semibold text-[#3A2A22]">
              Kitchen Preferences
            </h2>
            <p className="text-xs text-[#766257]">Saved on this device only</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close preferences"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-[#766257] hover:text-[#3A2A22] hover:bg-[#FBF6EC] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-7">
          {/* Allergies */}
          <section className="space-y-2.5">
            <h3 className="text-base font-semibold text-[#3A2A22]">Allergies (hard rule)</h3>
            <div className="flex flex-wrap gap-2">
              {ALLERGY_OPTIONS.map((item) => {
                const active = profile.allergies.includes(item);
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => toggleItem('allergies', item)}
                    className={`min-h-[40px] px-3.5 rounded-xl border text-sm font-medium cursor-pointer ${
                      active
                        ? 'bg-[#C85A32] border-[#C85A32] text-white'
                        : 'bg-[#FFFDF8] border-[#DFD2B8] text-[#3A2A22]'
                    }`}
                  >
                    {item}
                  </button>
                );
              })}
              {profile.allergies
                .filter((a) => !ALLERGY_OPTIONS.includes(a))
                .map((custom) => (
                  <button
                    key={custom}
                    type="button"
                    onClick={() => removeFromList('allergies', custom)}
                    className="min-h-[40px] px-3.5 rounded-xl bg-[#C85A32] text-white text-sm font-medium flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>{custom}</span>
                    <X className="w-3.5 h-3.5" />
                  </button>
                ))}
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                addToList('allergies', newAllergy, () => setNewAllergy(''));
              }}
              className="flex gap-2"
            >
              <input
                type="text"
                value={newAllergy}
                onChange={(e) => setNewAllergy(e.target.value)}
                placeholder="Add another allergy..."
                className="flex-1 min-h-[40px] rounded-xl bg-[#FFFDF8] border border-[#DFD2B8] px-3 text-sm text-[#3A2A22] focus:outline-none focus:border-[#C85A32]"
              />
              <button
                type="submit"
                className="min-h-[40px] px-3.5 rounded-xl bg-[#F3EBD9] text-sm font-medium text-[#3A2A22] flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Add
              </button>
            </form>
          </section>

          {/* Diet */}
          <section className="space-y-2.5">
            <h3 className="text-base font-semibold text-[#3A2A22]">Diet (hard rule)</h3>
            <div className="flex flex-wrap gap-2">
              {DIET_OPTIONS.map((item) => {
                const active = profile.diet.includes(item);
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => toggleItem('diet', item)}
                    className={`min-h-[40px] px-3.5 rounded-xl border text-sm font-medium cursor-pointer ${
                      active
                        ? 'bg-[#5C7A5B] border-[#5C7A5B] text-white'
                        : 'bg-[#FFFDF8] border-[#DFD2B8] text-[#3A2A22]'
                    }`}
                  >
                    {item}
                  </button>
                );
              })}
            </div>
          </section>

          {/* Kitchen Equipment */}
          <section className="space-y-2.5">
            <h3 className="text-base font-semibold text-[#3A2A22]">Kitchen equipment</h3>
            <div className="flex flex-wrap gap-2">
              {EQUIPMENT_OPTIONS.map((item) => {
                const active = profile.equipment.includes(item);
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => toggleItem('equipment', item)}
                    className={`min-h-[40px] px-3.5 rounded-xl border text-sm font-medium capitalize cursor-pointer ${
                      active
                        ? 'bg-[#3A2A22] border-[#3A2A22] text-white'
                        : 'bg-[#FFFDF8] border-[#DFD2B8] text-[#3A2A22]'
                    }`}
                  >
                    {item}
                  </button>
                );
              })}
            </div>
          </section>

          {/* Pantry Staples */}
          <section className="space-y-2.5">
            <h3 className="text-base font-semibold text-[#3A2A22]">Pantry staples we assume you have</h3>
            <div className="flex flex-wrap gap-2">
              {profile.staples.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => removeFromList('staples', item)}
                  className="min-h-[38px] px-3 rounded-xl bg-[#FFFDF8] border border-[#DFD2B8] text-sm text-[#3A2A22] flex items-center gap-1.5 hover:border-[#C85A32] cursor-pointer"
                >
                  <span>{item}</span>
                  <X className="w-3.5 h-3.5 text-[#9A877B]" />
                </button>
              ))}
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                addToList('staples', newStaple, () => setNewStaple(''));
              }}
              className="flex gap-2"
            >
              <input
                type="text"
                value={newStaple}
                onChange={(e) => setNewStaple(e.target.value)}
                placeholder="Add a staple (e.g. soy sauce, garlic)..."
                className="flex-1 min-h-[40px] rounded-xl bg-[#FFFDF8] border border-[#DFD2B8] px-3 text-sm text-[#3A2A22] focus:outline-none focus:border-[#C85A32]"
              />
              <button
                type="submit"
                className="min-h-[40px] px-3.5 rounded-xl bg-[#F3EBD9] text-sm font-medium text-[#3A2A22] flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Add
              </button>
            </form>
          </section>

          {/* Dislikes */}
          <section className="space-y-2.5">
            <h3 className="text-base font-semibold text-[#3A2A22]">Dislikes</h3>
            {profile.dislikes.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {profile.dislikes.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => removeFromList('dislikes', item)}
                    className="min-h-[38px] px-3 rounded-xl bg-[#FDF5D8] border border-[#E6C55E] text-sm text-[#3A2A22] flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>{item}</span>
                    <X className="w-3.5 h-3.5 text-[#8B6A1A]" />
                  </button>
                ))}
              </div>
            )}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                addToList('dislikes', newDislike, () => setNewDislike(''));
              }}
              className="flex gap-2"
            >
              <input
                type="text"
                value={newDislike}
                onChange={(e) => setNewDislike(e.target.value)}
                placeholder="e.g. cilantro, mushrooms, olives..."
                className="flex-1 min-h-[40px] rounded-xl bg-[#FFFDF8] border border-[#DFD2B8] px-3 text-sm text-[#3A2A22] focus:outline-none focus:border-[#C85A32]"
              />
              <button
                type="submit"
                className="min-h-[40px] px-3.5 rounded-xl bg-[#F3EBD9] text-sm font-medium text-[#3A2A22] flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Add
              </button>
            </form>
          </section>

          {/* Cooking Skill & Daily Protein Target */}
          <div className="grid sm:grid-cols-2 gap-5">
            <section className="space-y-2">
              <h3 className="text-base font-semibold text-[#3A2A22]">Cooking comfort</h3>
              <div className="flex gap-1.5">
                {(
                  [
                    { val: 'beginner', label: 'Simple' },
                    { val: 'comfortable', label: 'Comfortable' },
                    { val: 'confident', label: 'Confident' },
                  ] as Array<{ val: CookingSkill; label: string }>
                ).map((s) => (
                  <button
                    key={s.val}
                    type="button"
                    onClick={() => onUpdateProfile((p) => ({ ...p, skill: s.val }))}
                    className={`min-h-[40px] flex-1 rounded-xl border text-xs font-medium cursor-pointer ${
                      profile.skill === s.val
                        ? 'bg-[#C85A32] border-[#C85A32] text-white'
                        : 'bg-[#FFFDF8] border-[#DFD2B8] text-[#3A2A22]'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </section>

            <section className="space-y-2">
              <h3 className="text-base font-semibold text-[#3A2A22]">Daily protein target (g)</h3>
              <input
                type="number"
                min={0}
                max={400}
                value={profile.dailyProteinTarget ?? ''}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  onUpdateProfile((p) => ({
                    ...p,
                    dailyProteinTarget: Number.isNaN(val) || val <= 0 ? undefined : val,
                  }));
                }}
                placeholder="Optional (e.g. 120)"
                className="w-full min-h-[40px] rounded-xl bg-[#FFFDF8] border border-[#DFD2B8] px-3 text-sm text-[#3A2A22] tabular-nums focus:outline-none focus:border-[#C85A32]"
              />
            </section>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-[#FFFDF8] border-t border-[#E8DEC8]">
          <button
            type="button"
            onClick={onClose}
            className="w-full min-h-[48px] rounded-2xl bg-[#3A2A22] hover:bg-[#2A1E18] text-white font-semibold text-sm cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
