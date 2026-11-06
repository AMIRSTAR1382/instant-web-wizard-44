import { useState, type Dispatch, type SetStateAction } from "react";
import { ArrowLeft, Bell, BellOff, CheckCheck, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { notificationIcons, type Notification } from "@/data/notifications";
import { usePreferences } from "@/context/PreferencesContext";
import type { TranslationKey } from "@/i18n/en";
import { cn } from "@/lib/utils";

type NotifFilter = "all" | "unread" | "mentions" | "follows";

const filters: { key: NotifFilter; label: TranslationKey }[] = [
  { key: "all", label: "notifications.filter.all" },
  { key: "unread", label: "notifications.filter.unread" },
  { key: "mentions", label: "notifications.filter.mentions" },
  { key: "follows", label: "notifications.filter.follows" },
];

interface NotificationsPanelProps {
  notifications: Notification[];
  onNotificationsChange: Dispatch<SetStateAction<Notification[]>>;
  muted: boolean;
  onMutedChange: (muted: boolean) => void;
  onBack: () => void;
}

export const NotificationsPanel = ({
  notifications,
  onNotificationsChange,
  muted,
  onMutedChange,
  onBack,
}: NotificationsPanelProps) => {
  const { t, pick, formatNumber, formatRelative } = usePreferences();
  const [activeFilter, setActiveFilter] = useState<NotifFilter>("all");

  const filteredNotifications = notifications.filter((n) => {
    if (activeFilter === "unread") return !n.read;
    if (activeFilter === "mentions") return n.category === "mention";
    if (activeFilter === "follows") return n.category === "follow";
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = (id: number) => {
    onNotificationsChange((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllRead = () => {
    onNotificationsChange((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const deleteNotification = (id: number) => {
    onNotificationsChange((prev) => prev.filter((n) => n.id !== id));
  };

  const clearAll = () => {
    const previous = notifications;
    onNotificationsChange([]);
    toast(t("notifications.cleared"), {
      action: { label: t("common.undo"), onClick: () => onNotificationsChange(previous) },
    });
  };

  return (
    <div className="absolute inset-0 overflow-y-auto p-6">
      <div className="mb-6 flex items-center gap-3">
        <button
          onClick={onBack}
          aria-label={t("common.back")}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary transition-all duration-200 hover:-translate-x-1 hover:bg-primary/20 rtl:hover:translate-x-1"
        >
          <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
        </button>
        <h2 className="flex-1 text-lg font-bold">{t("notifications.title")}</h2>
        {unreadCount > 0 && (
          <span className="rounded-full bg-primary/20 px-2 py-0.5 text-xs font-medium text-primary">
            {formatNumber(unreadCount)}
          </span>
        )}
        <button
          onClick={() => onMutedChange(!muted)}
          aria-pressed={muted}
          aria-label={muted ? t("notifications.unmute") : t("notifications.mute")}
          title={muted ? t("notifications.unmute") : t("notifications.mute")}
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-full transition-all",
            muted ? "bg-destructive/20 text-destructive" : "bg-secondary hover:bg-primary/20",
          )}
        >
          {muted ? <BellOff className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
        </button>
      </div>

      {muted && <p className="mb-4 text-xs text-muted-foreground">{t("notifications.mutedNotice")}</p>}

      {/* Filters */}
      <div className="no-scrollbar mb-4 flex gap-2 overflow-x-auto pb-1">
        {filters.map((filter) => (
          <button
            key={filter.key}
            onClick={() => setActiveFilter(filter.key)}
            aria-pressed={activeFilter === filter.key}
            className={cn(
              "whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium transition-all",
              activeFilter === filter.key
                ? "bg-primary text-primary-foreground"
                : "bg-secondary/50 text-muted-foreground hover:bg-secondary",
            )}
          >
            {t(filter.label)}
          </button>
        ))}
      </div>

      {/* Actions */}
      {notifications.length > 0 && (
        <div className="mb-4 flex gap-2">
          <button
            onClick={markAllRead}
            disabled={unreadCount === 0}
            className="flex items-center gap-1.5 rounded-lg bg-secondary/50 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
          >
            <CheckCheck className="h-3.5 w-3.5" />
            {t("notifications.markAllRead")}
          </button>
          <button
            onClick={clearAll}
            className="flex items-center gap-1.5 rounded-lg bg-secondary/50 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 className="h-3.5 w-3.5" />
            {t("notifications.clearAll")}
          </button>
        </div>
      )}

      {/* Notifications List */}
      <ul className="space-y-2">
        {filteredNotifications.length === 0 ? (
          <li className="py-12 text-center">
            <Bell className="mx-auto mb-3 h-12 w-12 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">
              {activeFilter === "unread" ? t("notifications.emptyUnreadTitle") : t("notifications.emptyTitle")}
            </p>
            <p className="mt-1 text-xs text-muted-foreground/60">
              {activeFilter === "unread" ? t("notifications.emptyUnreadText") : t("notifications.emptyText")}
            </p>
          </li>
        ) : (
          filteredNotifications.map((notification, index) => {
            const Icon = notificationIcons[notification.category];
            return (
              <li
                key={notification.id}
                className={cn(
                  "group relative flex animate-fade-in items-start gap-3 rounded-lg p-3 transition-all",
                  notification.read ? "hover:bg-secondary/50" : "border-s-2 border-primary bg-primary/5 hover:bg-primary/10",
                )}
                style={{ animationDelay: `${index * 0.03}s` }}
              >
                {/* The whole row marks the notification as read; the delete button sits on top of it. */}
                <button
                  onClick={() => markAsRead(notification.id)}
                  className="flex min-w-0 flex-1 items-start gap-3 text-start"
                  aria-label={`${pick(notification.title)}: ${pick(notification.description)}`}
                >
                  <div
                    className={cn(
                      "flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-transform group-hover:scale-110",
                      notification.read ? "bg-secondary" : "bg-gradient-to-br from-accent/30 to-primary/30",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className={cn("text-sm", !notification.read && "font-semibold")}>{pick(notification.title)}</p>
                      {!notification.read && <span className="h-2 w-2 shrink-0 rounded-full bg-primary" aria-hidden="true" />}
                    </div>
                    <p className="truncate text-xs text-muted-foreground">{pick(notification.description)}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground/60">{formatRelative(notification.at)}</p>
                  </div>
                </button>
                {/* Always visible on touch screens; on devices with a mouse it appears on hover/focus. */}
                <button
                  onClick={() => deleteNotification(notification.id)}
                  aria-label={t("notifications.delete")}
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-secondary opacity-100 transition-all hover:bg-destructive/20 hover:text-destructive focus-visible:opacity-100 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </li>
            );
          })
        )}
      </ul>
    </div>
  );
};
