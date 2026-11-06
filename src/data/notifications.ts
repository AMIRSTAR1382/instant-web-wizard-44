import { AtSign, Heart, MessageCircle, UserPlus, type LucideIcon } from "lucide-react";
import type { LocalizedText } from "@/lib/i18n";

export type NotificationCategory = "follow" | "like" | "message" | "mention";

/** Saved in localStorage, so it holds only plain data (the icon comes from the category). */
export interface Notification {
  id: number;
  category: NotificationCategory;
  title: LocalizedText;
  description: LocalizedText;
  /** Milliseconds since 1970. */
  at: number;
  read: boolean;
}

export const notificationIcons: Record<NotificationCategory, LucideIcon> = {
  follow: UserPlus,
  like: Heart,
  message: MessageCircle,
  mention: AtSign,
};

const minutesAgo = (minutes: number) => Date.now() - minutes * 60_000;

const title = {
  follow: { en: "New follower", fa: "دنبال‌کننده‌ی جدید" },
  like: { en: "New like", fa: "لایک جدید" },
  message: { en: "New message", fa: "پیام جدید" },
  mention: { en: "Mention", fa: "منشن" },
} satisfies Record<NotificationCategory, LocalizedText>;

/** Example notifications for a first visit (there is no server yet). */
export const createInitialNotifications = (): Notification[] => [
  { id: 1, category: "follow", title: title.follow, description: { en: "Sasuke started following you", fa: "ساسکه دنبالت کرد" }, at: minutesAgo(2), read: false },
  { id: 2, category: "like", title: title.like, description: { en: "Hinata liked your post in Gaming", fa: "هیناتا پستت در گیمینگ را لایک کرد" }, at: minutesAgo(5), read: false },
  { id: 3, category: "message", title: title.message, description: { en: "Kakashi sent you a message", fa: "کاکاشی برایت پیام فرستاد" }, at: minutesAgo(10), read: false },
  { id: 4, category: "mention", title: title.mention, description: { en: "Naruto mentioned you in Gaming Zone", fa: "ناروتو در گیمینگ زون منشنت کرد" }, at: minutesAgo(15), read: false },
  { id: 5, category: "follow", title: title.follow, description: { en: "Itachi started following you", fa: "ایتاچی دنبالت کرد" }, at: minutesAgo(60), read: true },
  { id: 6, category: "like", title: { en: "Post trending", fa: "پستت داغ شد" }, description: { en: "Your post in Coding reached 50 likes!", fa: "پستت در برنامه‌نویسی به ۵۰ لایک رسید!" }, at: minutesAgo(120), read: true },
  { id: 7, category: "message", title: { en: "Group message", fa: "پیام گروهی" }, description: { en: "New activity in the Technology discussion", fa: "فعالیت تازه در گفتگوی فناوری" }, at: minutesAgo(180), read: true },
  { id: 8, category: "mention", title: title.mention, description: { en: "Sakura mentioned you in Rock Nation", fa: "ساکورا در ملت راک منشنت کرد" }, at: minutesAgo(300), read: true },
  { id: 9, category: "follow", title: title.follow, description: { en: "Rock Lee started following you", fa: "راک لی دنبالت کرد" }, at: minutesAgo(1440), read: true },
  { id: 10, category: "like", title: title.like, description: { en: "Gaara liked your comment", fa: "گارا کامنتت را لایک کرد" }, at: minutesAgo(1500), read: true },
];
