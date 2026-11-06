import { AtSign, Heart, MessageCircle, UserPlus, type LucideIcon } from "lucide-react";

export type NotificationCategory = "follow" | "like" | "message" | "mention";

export interface Notification {
  id: number;
  icon: LucideIcon;
  title: string;
  description: string;
  time: string;
  read: boolean;
  category: NotificationCategory;
}

export const initialNotifications: Notification[] = [
  { id: 1, icon: UserPlus, title: "New follower", description: "Sasuke started following you", time: "2 min ago", read: false, category: "follow" },
  { id: 2, icon: Heart, title: "New like", description: "Hinata liked your post in Gaming", time: "5 min ago", read: false, category: "like" },
  { id: 3, icon: MessageCircle, title: "New message", description: "Kakashi sent you a message", time: "10 min ago", read: false, category: "message" },
  { id: 4, icon: AtSign, title: "Mention", description: "You were mentioned in Gaming community by Naruto", time: "15 min ago", read: false, category: "mention" },
  { id: 5, icon: UserPlus, title: "New follower", description: "Itachi started following you", time: "1 hour ago", read: true, category: "follow" },
  { id: 6, icon: Heart, title: "Post trending", description: "Your post in Coding reached 50 likes!", time: "2 hours ago", read: true, category: "like" },
  { id: 7, icon: MessageCircle, title: "Group message", description: "New activity in Technology discussion", time: "3 hours ago", read: true, category: "message" },
  { id: 8, icon: AtSign, title: "Mention", description: "Sakura mentioned you in Music community", time: "5 hours ago", read: true, category: "mention" },
  { id: 9, icon: UserPlus, title: "New follower", description: "Rock Lee started following you", time: "1 day ago", read: true, category: "follow" },
  { id: 10, icon: Heart, title: "New like", description: "Gaara liked your comment", time: "1 day ago", read: true, category: "like" },
];
