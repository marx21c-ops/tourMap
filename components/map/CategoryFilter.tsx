"use client";

import { PlaceCategory, CATEGORY_COLORS, CATEGORY_LABELS, CATEGORY_EMOJIS } from "@/types";

const ALL_CATEGORIES: PlaceCategory[] = ["hanok", "cafe", "food", "photo", "workshop", "culture"];

interface Props {
  activeCategory: string;
  onChange: (cat: string) => void;
}

export default function CategoryFilter({ activeCategory, onChange }: Props) {
  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-hide px-4 pb-1 pt-2">
      <button
        onClick={() => onChange("all")}
        className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
          activeCategory === "all"
            ? "bg-gray-900 text-white border-gray-900"
            : "bg-white text-gray-600 border-gray-200"
        }`}
      >
        전체
      </button>
      {ALL_CATEGORIES.map((cat) => (
        <button
          key={cat}
          onClick={() => onChange(cat)}
          className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-all"
          style={
            activeCategory === cat
              ? { backgroundColor: CATEGORY_COLORS[cat], color: "white", borderColor: CATEGORY_COLORS[cat] }
              : { backgroundColor: "white", color: "#4B5563", borderColor: "#E5E7EB" }
          }
        >
          <span>{CATEGORY_EMOJIS[cat]}</span>
          <span>{CATEGORY_LABELS[cat]}</span>
        </button>
      ))}
    </div>
  );
}
