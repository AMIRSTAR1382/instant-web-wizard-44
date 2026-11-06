import { Code, Cpu, Film, Gamepad2, Music, Palette, type LucideIcon } from "lucide-react";
import heroBanner from "@/assets/hero-banner.webp";
import gamingZone from "@/assets/gaming-zone.webp";
import vrCommunity from "@/assets/vr-community.webp";
import art3d from "@/assets/3d-art.webp";
import nftCommunity from "@/assets/nft-community.webp";
import type { LocalizedText } from "@/lib/i18n";

/*
 * Communities are stored by image *key*, not by image URL: Vite renames image files on every
 * build, so a saved URL would break after the next deploy.
 */
export const communityImages = {
  hero: heroBanner,
  gaming: gamingZone,
  vr: vrCommunity,
  art: art3d,
  nft: nftCommunity,
} as const;

export type CommunityImageKey = keyof typeof communityImages;
export const communityImageKeys = Object.keys(communityImages) as CommunityImageKey[];

export const getCommunityImage = (key: string) =>
  communityImages[key as CommunityImageKey] ?? communityImages.hero;

export type CategoryId = "gaming" | "music" | "entertainment" | "coding" | "technology" | "art";

export interface Category {
  id: CategoryId;
  icon: LucideIcon;
  image: CommunityImageKey;
  name: LocalizedText;
  tagline: LocalizedText;
}

export const categories: Category[] = [
  {
    id: "gaming",
    icon: Gamepad2,
    image: "gaming",
    name: { en: "Gaming", fa: "گیمینگ" },
    tagline: { en: "Join millions of gamers worldwide", fa: "به میلیون‌ها گیمر در سراسر دنیا بپیوند" },
  },
  {
    id: "music",
    icon: Music,
    image: "hero",
    name: { en: "Music", fa: "موسیقی" },
    tagline: { en: "Connect with music lovers", fa: "با عاشقان موسیقی آشنا شو" },
  },
  {
    id: "entertainment",
    icon: Film,
    image: "nft",
    name: { en: "Entertainment", fa: "سرگرمی" },
    tagline: { en: "Movies, TV shows and more", fa: "فیلم، سریال و خیلی چیزهای دیگر" },
  },
  {
    id: "coding",
    icon: Code,
    image: "art",
    name: { en: "Coding", fa: "برنامه‌نویسی" },
    tagline: { en: "Learn and share code with developers", fa: "با برنامه‌نویس‌ها یاد بگیر و کد به اشتراک بگذار" },
  },
  {
    id: "technology",
    icon: Cpu,
    image: "vr",
    name: { en: "Technology", fa: "فناوری" },
    tagline: { en: "Explore cutting-edge technology", fa: "فناوری‌های روز را کشف کن" },
  },
  {
    id: "art",
    icon: Palette,
    image: "art",
    name: { en: "Art & Design", fa: "هنر و طراحی" },
    tagline: { en: "Show your work and get inspired", fa: "آثارت را نشان بده و الهام بگیر" },
  },
];

export const categoryIds = categories.map((category) => category.id);

export const isCategoryId = (value: unknown): value is CategoryId =>
  typeof value === "string" && (categoryIds as string[]).includes(value);

export const getCategory = (id: CategoryId) => categories.find((category) => category.id === id)!;

export interface Community {
  /** Also the URL slug: /community/<id> */
  id: string;
  name: LocalizedText;
  description: LocalizedText;
  category: CategoryId;
  image: CommunityImageKey;
  members: number;
  online: number;
  featured?: boolean;
  /** Milliseconds since 1970; used for "Newest" sorting. */
  createdAt: number;
  /** Set on communities the visitor created in this browser. */
  createdByUser?: boolean;
}

export { seedCommunities, defaultJoinedIds } from "./seedCommunities";

/** Lower-case text with Arabic letter variants mapped to Persian, so "علي" finds "علی". */
export function normalizeForSearch(text: string) {
  return text
    .toLowerCase()
    .replace(/ي/g, "ی")
    .replace(/ك/g, "ک")
    .replace(/‌/g, "") // zero-width non-joiner (نیم‌فاصله)
    .replace(/[ً-ٟ]/g, "") // Arabic diacritics
    .trim();
}

/** True when every word of the query appears in the community's name, description or category, in either language. */
export function communityMatches(community: Community, query: string) {
  const words = normalizeForSearch(query).split(/\s+/).filter(Boolean);
  if (words.length === 0) return true;
  const category = getCategory(community.category);
  const haystack = normalizeForSearch(
    [community.name.en, community.name.fa, community.description.en, community.description.fa, category.name.en, category.name.fa].join(" "),
  );
  return words.every((word) => haystack.includes(word));
}
