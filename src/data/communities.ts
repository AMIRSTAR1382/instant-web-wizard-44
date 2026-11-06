import { Code, Cpu, Film, Gamepad2, Music, Palette, type LucideIcon } from "lucide-react";
import heroBanner from "@/assets/hero-banner.jpg";
import gamingZone from "@/assets/gaming-zone.jpg";
import vrCommunity from "@/assets/vr-community.jpg";
import art3d from "@/assets/3d-art.jpg";
import nftCommunity from "@/assets/nft-community.jpg";
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

const daysAgo = (days: number) => Date.UTC(2026, 10, 1) - days * 86_400_000;

export const seedCommunities: Community[] = [
  {
    id: "virtual-reality",
    name: { en: "Virtual Reality", fa: "واقعیت مجازی" },
    description: {
      en: "Virtual reality is a self-created form of chosen reality. Come build it with us.",
      fa: "واقعیت مجازی شکلی از واقعیتِ انتخاب‌شده است که خودمان می‌سازیم. بیا با هم بسازیمش.",
    },
    category: "technology",
    image: "vr",
    members: 142_000,
    online: 8_400,
    featured: true,
    createdAt: daysAgo(400),
  },
  {
    id: "gaming-zone",
    name: { en: "Gaming Zone", fa: "گیمینگ زون" },
    description: {
      en: "Video games foster the mindset that allows creativity to grow.",
      fa: "بازی‌های ویدیویی ذهنی می‌سازند که خلاقیت در آن رشد می‌کند.",
    },
    category: "gaming",
    image: "gaming",
    members: 128_400,
    online: 9_800,
    featured: true,
    createdAt: daysAgo(380),
  },
  {
    id: "fps-masters",
    name: { en: "FPS Masters", fa: "استادان FPS" },
    description: { en: "Competitive first-person shooter community", fa: "جامعه‌ی رقابتی بازی‌های شوتر اول‌شخص" },
    category: "gaming",
    image: "gaming",
    members: 256_000,
    online: 18_200,
    createdAt: daysAgo(300),
  },
  {
    id: "rpg-legends",
    name: { en: "RPG Legends", fa: "افسانه‌های RPG" },
    description: { en: "For role-playing game enthusiasts", fa: "برای علاقه‌مندان بازی‌های نقش‌آفرینی" },
    category: "gaming",
    image: "vr",
    members: 189_000,
    online: 11_300,
    createdAt: daysAgo(250),
  },
  {
    id: "indie-games-hub",
    name: { en: "Indie Games Hub", fa: "پاتوق بازی‌های مستقل" },
    description: { en: "Discover and discuss indie games", fa: "بازی‌های مستقل را کشف کن و درباره‌شان گپ بزن" },
    category: "gaming",
    image: "gaming",
    members: 94_000,
    online: 4_100,
    createdAt: daysAgo(90),
  },
  {
    id: "electronic-beats",
    name: { en: "Electronic Beats", fa: "بیت‌های الکترونیک" },
    description: { en: "EDM and electronic music producers", fa: "تهیه‌کنندگان موسیقی الکترونیک و EDM" },
    category: "music",
    image: "hero",
    members: 178_000,
    online: 7_200,
    createdAt: daysAgo(220),
  },
  {
    id: "jazz-blues",
    name: { en: "Jazz & Blues", fa: "جاز و بلوز" },
    description: { en: "Classic and modern jazz enthusiasts", fa: "علاقه‌مندان جاز کلاسیک و مدرن" },
    category: "music",
    image: "hero",
    members: 92_000,
    online: 2_900,
    createdAt: daysAgo(180),
  },
  {
    id: "rock-nation",
    name: { en: "Rock Nation", fa: "ملت راک" },
    description: { en: "Rock music from classic to modern", fa: "موسیقی راک، از کلاسیک تا مدرن" },
    category: "music",
    image: "hero",
    members: 234_000,
    online: 10_600,
    createdAt: daysAgo(330),
  },
  {
    id: "movie-buffs",
    name: { en: "Movie Buffs", fa: "عشق فیلم" },
    description: { en: "Discuss the latest movies and the classics", fa: "درباره‌ی فیلم‌های تازه و کلاسیک گفتگو کن" },
    category: "entertainment",
    image: "nft",
    members: 312_000,
    online: 15_800,
    createdAt: daysAgo(360),
  },
  {
    id: "tv-series-hub",
    name: { en: "TV Series Hub", fa: "پاتوق سریال" },
    description: { en: "Binge-watch together", fa: "با هم سریال ببینیم" },
    category: "entertainment",
    image: "nft",
    members: 198_000,
    online: 9_100,
    createdAt: daysAgo(150),
  },
  {
    id: "anime-world",
    name: { en: "Anime World", fa: "دنیای انیمه" },
    description: { en: "Anime and manga community", fa: "جامعه‌ی انیمه و مانگا" },
    category: "entertainment",
    image: "nft",
    members: 445_000,
    online: 27_400,
    createdAt: daysAgo(280),
  },
  {
    id: "web-developers",
    name: { en: "Web Developers", fa: "توسعه‌دهندگان وب" },
    description: { en: "Full-stack web development", fa: "توسعه‌ی وب فول‌استک" },
    category: "coding",
    image: "art",
    members: 523_000,
    online: 31_000,
    createdAt: daysAgo(420),
  },
  {
    id: "python-pros",
    name: { en: "Python Pros", fa: "حرفه‌ای‌های پایتون" },
    description: { en: "Python programming and data science", fa: "برنامه‌نویسی پایتون و علم داده" },
    category: "coding",
    image: "art",
    members: 367_000,
    online: 19_500,
    createdAt: daysAgo(310),
  },
  {
    id: "mobile-dev",
    name: { en: "Mobile Dev", fa: "توسعه‌ی موبایل" },
    description: { en: "iOS and Android development", fa: "توسعه‌ی iOS و اندروید" },
    category: "coding",
    image: "art",
    members: 214_000,
    online: 8_800,
    createdAt: daysAgo(120),
  },
  {
    id: "ai-machine-learning",
    name: { en: "AI & Machine Learning", fa: "هوش مصنوعی و یادگیری ماشین" },
    description: { en: "Artificial intelligence enthusiasts", fa: "علاقه‌مندان هوش مصنوعی" },
    category: "technology",
    image: "vr",
    members: 412_000,
    online: 22_700,
    createdAt: daysAgo(60),
  },
  {
    id: "vr-ar-world",
    name: { en: "VR/AR World", fa: "دنیای VR/AR" },
    description: { en: "Virtual and augmented reality", fa: "واقعیت مجازی و افزوده" },
    category: "technology",
    image: "vr",
    members: 156_000,
    online: 5_300,
    createdAt: daysAgo(200),
  },
  {
    id: "iot-makers",
    name: { en: "IoT Makers", fa: "سازندگان اینترنت اشیا" },
    description: { en: "Internet of Things projects", fa: "پروژه‌های اینترنت اشیا" },
    category: "technology",
    image: "vr",
    members: 98_000,
    online: 3_200,
    createdAt: daysAgo(30),
  },
  {
    id: "3d-art",
    name: { en: "3D Art", fa: "هنر سه‌بعدی" },
    description: { en: "A great place to show your art", fa: "جایی عالی برای نمایش آثارت" },
    category: "art",
    image: "art",
    members: 87_000,
    online: 3_900,
    createdAt: daysAgo(45),
  },
  {
    id: "nft",
    name: { en: "NFT", fa: "NFT" },
    description: { en: "A great place to share your NFTs", fa: "جایی برای به اشتراک گذاشتن NFTهایت" },
    category: "art",
    image: "nft",
    members: 64_000,
    online: 2_100,
    createdAt: daysAgo(15),
  },
];

/** The communities a first-time visitor is already a member of (the icons in the left rail). */
export const defaultJoinedIds = ["virtual-reality", "gaming-zone", "nft"];

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
