import { useState } from "react";
import {
  ArrowLeft, UserPlus, Heart, MessageCircle, AtSign,
  Check, CheckCheck, Filter, Trash2, Bell, BellOff
} from "lucide-react";

type NotifFilter = "all" | "unread" | "mentions" | "follows";

interface Notification {
  id: number;
  icon: typeof UserPlus;
  title: string;
  description: string;
  time: string;
  read: boolean;
  category: NotifFilter;
}

const initialNotifications: Notification[] = [
  { id: 1, icon: UserPlus, title: "New follower", description: "Sasuke started following you", time: "2 min ago", read: false, category: "follows" },
  { id: 2, icon: Heart, title: "New like", description: "Hinata liked your post in Gaming", time: "5 min ago", read: false, category: "all" },
  { id: 3, icon: MessageCircle, title: "New message", description: "Kakashi sent you a message", time: "10 min ago", read: false, category: "all" },
  { id: 4, icon: AtSign, title: "Mention", description: "You were mentioned in Gaming community by Naruto", time: "15 min ago", read: false, category: "mentions" },
  { id: 5, icon: UserPlus, title: "New follower", description: "Itachi started following you", time: "1 hour ago", read: true, category: "follows" },
  { id: 6, icon: Heart, title: "Post trending", description: "Your post in Coding reached 50 likes!", time: "2 hours ago", read: true, category: "all" },
  { id: 7, icon: MessageCircle, title: "Group message", description: "New activity in Technology discussion", time: "3 hours ago", read: true, category: "all" },
  { id: 8, icon: AtSign, title: "Mention", description: "Sakura mentioned you in Music community", time: "5 hours ago", read: true, category: "mentions" },
  { id: 9, icon: UserPlus, title: "New follower", description: "Rock Lee started following you", time: "1 day ago", read: true, category: "follows" },
  { id: 10, icon: Heart, title: "New like", description: "Gaara liked your comment", time: "1 day ago", read: true, category: "all" },
];

const filters: { key: NotifFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "unread", label: "Unread" },
  { key: "mentions", label: "Mentions" },
  { key: "follows", label: "Follows" },
];

interface NotificationsPanelProps {
  onBack: () => void;
}

export const NotificationsPanel = ({ onBack }: NotificationsPanelProps) => {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [activeFilter, setActiveFilter] = useState<NotifFilter>("all");
  const [muteAll, setMuteAll] = useState(false);

  const filteredNotifications = notifications.filter((n) => {
    if (activeFilter === "unread") return !n.read;
    if (activeFilter === "mentions") return n.category === "mentions";
    if (activeFilter === "follows") return n.category === "follows";
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = (id: number) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const deleteNotification = (id: number) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  return (
    <div className="absolute inset-0 p-6 overflow-y-auto">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={onBack}
          className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center hover:bg-primary/20 transition-all hover:-translate-x-1 duration-200"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h2 className="text-lg font-bold flex-1">Notifications</h2>
        {unreadCount > 0 && (
          <span className="px-2 py-0.5 rounded-full bg-primary/20 text-primary text-xs font-medium">
            {unreadCount}
          </span>
        )}
        <button
          onClick={() => setMuteAll(!muteAll)}
          className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
            muteAll ? "bg-destructive/20 text-destructive" : "bg-secondary hover:bg-primary/20"
          }`}
          title={muteAll ? "Unmute notifications" : "Mute all"}
        >
          {muteAll ? <BellOff className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        {filters.map((filter) => (
          <button
            key={filter.key}
            onClick={() => setActiveFilter(filter.key)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
              activeFilter === filter.key
                ? "bg-primary text-primary-foreground"
                : "bg-secondary/50 text-muted-foreground hover:bg-secondary"
            }`}
          >
            {filter.label}
            {filter.key === "unread" && unreadCount > 0 && (
              <span className="ml-1">({unreadCount})</span>
            )}
          </button>
        ))}
      </div>

      {/* Actions */}
      {notifications.length > 0 && (
        <div className="flex gap-2 mb-4">
          <button
            onClick={markAllRead}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary/50 text-xs text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            Mark all read
          </button>
          <button
            onClick={clearAll}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary/50 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear all
          </button>
        </div>
      )}

      {/* Notifications List */}
      <div className="space-y-2">
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-12">
            <Bell className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              {activeFilter === "unread" ? "No unread notifications" : "No notifications yet"}
            </p>
            <p className="text-xs text-muted-foreground/60 mt-1">
              {activeFilter === "unread" ? "You're all caught up!" : "We'll notify you when something happens"}
            </p>
          </div>
        ) : (
          filteredNotifications.map((notification, index) => (
            <div
              key={notification.id}
              onClick={() => markAsRead(notification.id)}
              className={`flex items-start gap-3 p-3 rounded-lg transition-all group cursor-pointer animate-fade-in relative ${
                notification.read
                  ? "hover:bg-secondary/50"
                  : "bg-primary/5 hover:bg-primary/10 border-l-2 border-primary"
              }`}
              style={{ animationDelay: `${index * 0.03}s` }}
            >
              <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 ${
                notification.read
                  ? "bg-secondary"
                  : "bg-gradient-to-br from-accent/30 to-primary/30"
              }`}>
                <notification.icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className={`text-sm ${notification.read ? "" : "font-semibold"}`}>{notification.title}</p>
                  {!notification.read && (
                    <div className="w-2 h-2 rounded-full bg-primary shrink-0" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground truncate">{notification.description}</p>
                <p className="text-xs text-muted-foreground/50 mt-0.5">{notification.time}</p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteNotification(notification.id);
                }}
                className="opacity-0 group-hover:opacity-100 w-6 h-6 rounded-full bg-secondary flex items-center justify-center hover:bg-destructive/20 hover:text-destructive transition-all shrink-0"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
