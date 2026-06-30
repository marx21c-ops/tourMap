"use client";

import { PlaceCategory, CATEGORY_LABELS, CATEGORY_EMOJIS, CATEGORY_COLORS } from "@/types";

const ALL_CATEGORIES: PlaceCategory[] = ["hanok", "cafe", "food", "photo", "workshop", "culture"];

const LIGHT_CATEGORIES = new Set<PlaceCategory>(["cafe"]);

interface Props {
  activeCategory: string;
  onChange: (cat: string) => void;
}

export default function CategoryFilter({ activeCategory, onChange }: Props) {
  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-hide px-5 pb-2 pt-1">
      <button
        onClick={() => onChange("all")}
        className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium border transition-all"
        style={
          activeCategory === "all"
            ? { backgroundColor: "#151613", color: "#FFFFFF", borderColor: "#151613" }
            : { backgroundColor: "#FFFFFF", color: "#151613", borderColor: "#E2E2E2" }
        }
      >
        전체
      </button>
      {ALL_CATEGORIES.map((cat) => {
        const isActive = activeCategory === cat;
        const catColor = CATEGORY_COLORS[cat];
        const textColor = isActive
          ? LIGHT_CATEGORIES.has(cat) ? "#151613" : "#FFFFFF"
          : "#151613";
        return (
          <button
            key={cat}
            onClick={() => onChange(cat)}
            className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium border transition-all"
            style={
              isActive
                ? { backgroundColor: catColor, color: textColor, borderColor: catColor }
                : { backgroundColor: "#FFFFFF", color: "#151613", borderColor: "#E2E2E2" }
            }
          >
            <span>{CATEGORY_EMOJIS[cat]}</span>
            <span>{CATEGORY_LABELS[cat]}</span>
          </button>
        );
      })}
    </div>
  );
}
