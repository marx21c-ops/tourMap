export type PlaceCategory =
  | "hanok"
  | "cafe"
  | "food"
  | "photo"
  | "workshop"
  | "culture";

export type IkseonPlace = {
  id: string;
  name: string;
  category: PlaceCategory;
  lat: number;
  lng: number;
  address: string;
  shortDescription: string;
  question: string;
  shortAnswer: string;
  followUpQuestions: string[];
  tags: string[];
  estimatedStayMinutes: number;
  paid: boolean;
  imageUrl?: string;
};

export interface Course {
  id: string;
  title: string;
  subtitle: string;
  coverImage: string;
  duration: string;
  placeCount: number;
  difficulty: "쉬움" | "보통" | "어려움";
  completionRate: number;
  placeIds: string[];
  description: string;
  docentName: string;
  docentAvatar: string;
  tags: string[];
}

export const CATEGORY_COLORS: Record<PlaceCategory, string> = {
  hanok: "#8B5E3C",
  cafe: "#F4A6B8",
  food: "#F59E0B",
  photo: "#8B5CF6",
  workshop: "#22C55E",
  culture: "#3B82F6",
};

export const CATEGORY_LABELS: Record<PlaceCategory, string> = {
  hanok: "한옥·골목",
  cafe: "카페·디저트",
  food: "음식·미식",
  photo: "사진·레트로",
  workshop: "공방·체험",
  culture: "문화·역사",
};

export const CATEGORY_EMOJIS: Record<PlaceCategory, string> = {
  hanok: "🏛️",
  cafe: "☕",
  food: "🍜",
  photo: "📸",
  workshop: "🎨",
  culture: "🏯",
};

export const IKSEON_CENTER = { lat: 37.5756, lng: 126.9889 };
