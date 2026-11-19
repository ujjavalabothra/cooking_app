import React, { useRef, useState } from 'react';
import {
  Plus,
  X,
  Camera,
  AlertTriangle,
  Beef,
  Carrot,
  Apple,
  Milk,
  Package,
  Utensils,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';
import { DetectedIngredient, IngredientCategory } from '../types';

interface IngredientReviewProps {
  ingredients: DetectedIngredient[];
  photoCount: number;
  isAddingPhoto: boolean;
  onRemoveIngredient: (id: string) => void;
  onAddIngredient: (name: string, category: IngredientCategory) => void;
  onAddAnotherPhoto: (files: FileList) => void;
  onContinue: () => void;
  onBack: () => void;
}

const CATEGORY_META: Record<
  IngredientCategory,
  { label: string; Icon: React.ComponentType<{ className?: string }> }
> = {
  protein: { label: 'Protein', Icon: Beef },
  vegetable: { label: 'Vegetables', Icon: Carrot },
  fruit: { label: 'Fruit', Icon: Apple },
  dairy: { label: 'Dairy & Eggs', Icon: Milk },
  pantry: { label: 'Pantry & Jars', Icon: Package },
  other: { label: 'Other', Icon: Utensils },
};

const CATEGORY_ORDER: IngredientCategory[] = [
  'protein',
  'vegetable',
  'dairy',
  'fruit',
  'pantry',
  'other',
];

export function IngredientReview({
  ingredients,
  photoCount,
  isAddingPhoto,
  onRemoveIngredient,
  onAddIngredient,
  onAddAnotherPhoto,
  onContinue,
  onBack,
}: IngredientReviewProps) {
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState<IngredientCategory>('vegetable');
  const [showAddForm, setShowAddForm] = useState(false);
  const addPhotoInputRef = useRef<HTMLInputElement>(null);

  const grouped = CATEGORY_ORDER.map((cat) => ({
    category: cat,
    items: ingredients.filter((i) => i.category === cat),
  })).filter((g) => g.items.length > 0);

  const lowConfidenceCount = ingredients.filter((i) => i.confidence === 'low').length;

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newName.trim();
    if (!trimmed) return;
    onAddIngredient(trimmed, newCategory);
    setNewName('');
    setShowAddForm(false);
  };

  return (
    <div className="space-y-6 pb-28 sm:pb-12">
      <input
        ref={addPhotoInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            onAddAnotherPhoto(e.target.files);
            e.target.value = '';
          }
        }}
        className="hidden"
      />

      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={onBack}
          className="min-h-[44px] px-3 -ml-3 rounded-xl text-sm font-medium text-[#766257] hover:text-[#3A2A22] hover:bg-[#F3EBD9]/60 flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Start over</span>
        </button>

        <span className="text-xs text-[#766257] tabular-nums">
          {photoCount} of 3 {photoCount === 1 ? 'photo' : 'photos'} · {ingredients.length} items
        </span>
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-semibold text-[#3A2A22]">
          Here&apos;s what I spotted
        </h1>
        <p className="text-sm sm:text-base text-[#766257]">
          Tap any label to remove it, or add anything hiding in the back.
        </p>
      </div>

      {lowConfidenceCount > 0 && (
        <div className="rounded-2xl bg-[#FDF5D8] border border-[#E6C55E] px-4 py-3 text-sm text-[#3A2A22] flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-[#A47914] mt-0.5 shrink-0" />
          <span>
            Highlighted items were a little hard to see—tap to remove if I guessed wrong.
          </span>
        </div>
      )}

      {/* Action row: Add item + Add another photo */}
      <div className="flex flex-wrap gap-2.5">
        <button
          type="button"
          onClick={() => setShowAddForm((prev) => !prev)}
          className="min-h-[44px] px-4 py-2 rounded-xl bg-[#FFFDF8] hover:bg-[#F3EBD9] border border-[#DFD2B8] text-sm font-medium text-[#3A2A22] flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4 text-[#C85A32]" />
          <span>Add ingredient</span>
        </button>

        {photoCount < 3 && (
          <button
            type="button"
            disabled={isAddingPhoto}
            onClick={() => addPhotoInputRef.current?.click()}
            className="min-h-[44px] px-4 py-2 rounded-xl bg-[#FFFDF8] hover:bg-[#F3EBD9] border border-[#DFD2B8] text-sm font-medium text-[#3A2A22] flex items-center gap-1.5 transition-colors disabled:opacity-60 cursor-pointer"
          >
            <Camera className="w-4 h-4 text-[#5C7A5B]" />
            <span>{isAddingPhoto ? 'Scanning photo…' : 'Add another photo'}</span>
          </button>
        )}
      </div>

      {/* Inline quick-add form */}
      {showAddForm && (
        <form
          onSubmit={handleAddSubmit}
          className="rounded-2xl bg-[#FFFDF8] border border-[#E8DEC8] p-4 flex flex-col sm:flex-row gap-3"
        >
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="e.g. cheddar cheese, scallions, tofu..."
            autoFocus
            className="flex-1 min-h-[44px] rounded-xl bg-[#FBF6EC] border border-[#DFD2B8] px-3.5 text-sm text-[#3A2A22] placeholder:text-[#9A877B] focus:outline-none focus:border-[#C85A32]"
          />
          <select
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value as IngredientCategory)}
            aria-label="Ingredient category"
            className="min-h-[44px] rounded-xl bg-[#FBF6EC] border border-[#DFD2B8] px-3 text-sm text-[#3A2A22] focus:outline-none focus:border-[#C85A32]"
          >
            {CATEGORY_ORDER.map((cat) => (
              <option key={cat} value={cat}>
                {CATEGORY_META[cat].label}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="min-h-[44px] px-5 rounded-xl bg-[#C85A32] hover:bg-[#AD4924] text-white text-sm font-semibold transition-colors cursor-pointer"
          >
            Add
          </button>
        </form>
      )}

      {/* Grouped Pantry-Label Chips */}
      {grouped.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#DFD2B8] bg-[#FFFDF8] p-8 text-center space-y-2">
          <p className="font-serif text-lg text-[#3A2A22]">No ingredients listed yet</p>
          <p className="text-sm text-[#766257]">
            Try adding a few items above or snapping a clearer photo.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {grouped.map(({ category, items }) => {
            const { label, Icon } = CATEGORY_META[category];
            return (
              <div key={category} className="space-y-2.5">
                <h2 className="text-sm font-semibold text-[#766257] flex items-center gap-2">
                  <Icon className="w-4 h-4 text-[#5C7A5B]" />
                  <span>{label}</span>
                </h2>
                <div className="flex flex-wrap gap-2">
                  {items.map((item) => {
                    const isLow = item.confidence === 'low';
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => onRemoveIngredient(item.id)}
                        title="Tap to remove"
                        className={`min-h-[44px] px-3.5 py-2 rounded-xl border text-left transition-all active:scale-[0.98] flex items-center gap-2 cursor-pointer ${
                          isLow
                            ? 'bg-[#FDF5D8] border-[#E6C55E] text-[#3A2A22] hover:bg-[#FAEBB7]'
                            : 'bg-[#FFFDF8] border-[#DFD2B8] text-[#3A2A22] hover:border-[#C85A32]/60'
                        }`}
                      >
                        <div className="flex flex-col">
                          <span className="text-sm font-medium leading-tight">
                            {item.name}
                            {item.approx_amount ? (
                              <span className="text-[#766257] font-normal"> · {item.approx_amount}</span>
                            ) : null}
                          </span>
                          {(item.note || isLow) && (
                            <span className="text-[11px] text-[#8B6A1A] leading-tight mt-0.5">
                              {item.note || 'Unsure — tap to remove'}
                            </span>
                          )}
                        </div>
                        <X className="w-3.5 h-3.5 text-[#9A877B] shrink-0" />
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Sticky Bottom CTA on Mobile, Inline on Desktop */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#FBF6EC] via-[#FBF6EC] to-transparent sm:static sm:p-0 sm:bg-none sm:pt-4">
        <div className="max-w-5xl mx-auto flex justify-end">
          <button
            type="button"
            disabled={ingredients.length === 0}
            onClick={onContinue}
            className="w-full sm:w-auto min-h-[52px] px-8 rounded-2xl bg-[#C85A32] hover:bg-[#AD4924] disabled:opacity-50 text-white font-semibold text-base shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <span>Looks good — next</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
