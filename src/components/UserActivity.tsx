import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Bell, BellOff, LogIn, LogOut, Pencil, PlusCircle, Settings, Trash2, UserCog, X, type LucideIcon } from "lucide-react";
import { SettingsPanel } from "./user-activity/SettingsPanel";
import { NotificationsPanel } from "./user-activity/NotificationsPanel";
import { usePreferences } from "@/context/PreferencesContext";
import { useProfile } from "@/context/ProfileContext";
import { useDialogs } from "@/context/DialogsContext";
import { createInitialNotifications, type Notification } from "@/data/notifications";
import { useActivityLog, type ActivityType } from "@/hooks/use-activity-log";
import { useMediaQuery } from "@/hooks/use-media-query";
import { usePersistentState } from "@/hooks/use-persistent-state";
import type { TranslationKey } from "@/i18n/en";
import { cn } from "@/lib/utils";

type Panel = "main" | "settings" | "notifications";

// Sample members until there is a server.
const newMembers = [
  { name: "Naruto Uzumaki", minutesAgo: 3, avatar: "🦊" },
  { name: "Son Goku", minutesAgo: 12, avatar: "🐉" },
  { name: "Monkey D. Luffy", minutesAgo: 15, avatar: "🏴‍☠️" },
  { name: "Tanjiro Kamado", minutesAgo: 30, avatar: "⚔️" },
];
const pageLoadedAt = Date.now();

const activityDisplay: Record<ActivityType, { icon: LucideIcon; text: TranslationKey }> = {
  joined: { icon: LogIn, text: "activity.joined" },
  left: { icon: LogOut, text: "activity.left" },
  created: { icon: PlusCircle, text: "activity.created" },
  deleted: { icon: Trash2, text: "activity.deleted" },
  profile: { icon: UserCog, text: "activity.profile" },
};

interface UserActivityProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const UserActivity = ({ isOpen = false, onClose }: UserActivityProps) => {
  const { t, pick, formatRelative } = usePreferences();
  const { profile, avatarUrl } = useProfile();
  const { openEditProfile } = useDialogs();
  const { entries: activity, clear: clearActivity } = useActivityLog();
  const [activePanel, setActivePanel] = useState<Panel>("main");
  // Notifications live here (not inside NotificationsPanel) so the bell badge can read them too.
  const [notifications, setNotifications] = usePersistentState<Notification[]>(
    "notifications.items",
    createInitialNotifications(),
  );
  const [muted, setMuted] = usePersistentState("notifications.muted", false);

  // From xl up the panel is a permanent column; below that it is a slide-in drawer.
  const isDesktop = useMediaQuery("(min-width: 1280px)");
  const isVisible = isDesktop || isOpen;

  const asideRef = useRef<HTMLElement>(null);
  const mainPanelRef = useRef<HTMLDivElement>(null);
  const settingsPanelRef = useRef<HTMLDivElement>(null);
  const notificationsPanelRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const showUnreadDot = unreadCount > 0 && !muted;

  // Off-screen panels stay mounted for the slide animation; `inert` keeps them out of the
  // Tab order and away from screen readers until they are actually shown.
  useEffect(() => {
    if (asideRef.current) asideRef.current.inert = !isVisible;
    if (mainPanelRef.current) mainPanelRef.current.inert = activePanel !== "main";
    if (settingsPanelRef.current) settingsPanelRef.current.inert = activePanel !== "settings";
    if (notificationsPanelRef.current) notificationsPanelRef.current.inert = activePanel !== "notifications";
  }, [isVisible, activePanel]);

  // Move keyboard focus into the drawer when it opens on small screens.
  useEffect(() => {
    if (!isDesktop && isOpen) asideRef.current?.focus();
  }, [isDesktop, isOpen]);

  // Escape closes the drawer on small screens.
  useEffect(() => {
    if (isDesktop || !isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isDesktop, isOpen, onClose]);

  // Following a link inside the drawer closes it on small screens.
  const closeIfDrawer = () => {
    if (!isDesktop) onClose?.();
  };

  return (
    <>
      {isOpen && (
        <div
          aria-hidden="true"
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm xl:hidden"
          onClick={onClose}
        />
      )}

      <aside
        ref={asideRef}
        tabIndex={-1}
        aria-label={t("panel.label")}
        className={cn(
          "fixed end-0 top-0 z-50 h-full w-80 max-w-[85vw] overflow-hidden border-s border-border bg-card outline-none",
          "transform transition-transform duration-300 ease-out",
          "xl:relative xl:max-w-none xl:translate-x-0 xl:rtl:translate-x-0",
          isOpen ? "translate-x-0" : "translate-x-full rtl:-translate-x-full",
        )}
      >
        {/* Main Content */}
        <div
          ref={mainPanelRef}
          className={cn(
            "absolute inset-0 overflow-y-auto p-6 transition-transform duration-300 ease-out",
            activePanel !== "main" ? "-translate-x-full rtl:translate-x-full" : "translate-x-0",
          )}
        >
          <div className="mb-8 flex items-center justify-between xl:justify-end">
            {/* Close button lives in the header row so it can't cover the other buttons. */}
            <button
              onClick={onClose}
              aria-label={t("panel.close")}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary transition-all hover:bg-primary/20 xl:hidden"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="flex gap-3">
              <button
                onClick={() => setActivePanel("notifications")}
                aria-label={showUnreadDot ? t("panel.notificationsUnread", { count: unreadCount }) : t("panel.notifications")}
                title={t("panel.notifications")}
                className="relative flex h-8 w-8 items-center justify-center rounded-full bg-card transition-colors duration-300 hover:scale-110 hover:bg-secondary"
              >
                {muted ? <BellOff className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
                {showUnreadDot && (
                  <span
                    aria-hidden="true"
                    className="absolute -end-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border border-card bg-primary"
                  />
                )}
              </button>
              <button
                onClick={() => setActivePanel("settings")}
                aria-label={t("panel.settings")}
                title={t("panel.settings")}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-card transition-colors duration-300 hover:rotate-90 hover:bg-secondary"
              >
                <Settings className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="mb-8">
            <div className="mb-4 flex items-center justify-center gap-4">
              <div className="flex h-24 items-center gap-1" aria-hidden="true">
                {[0.6, 1, 0.4, 0.8, 0.5].map((scale, i) => (
                  <div
                    key={`left-${i}`}
                    className="w-1 animate-voice-bar rounded-full bg-gradient-to-t from-primary to-accent"
                    style={{ animationDelay: `${i * 0.1}s`, height: `${scale * 100}%` }}
                  />
                ))}
              </div>
              <div className="relative h-24 w-24">
                <div className="absolute inset-0 animate-pulse rounded-full bg-gradient-accent opacity-50 blur-xl" />
                <img
                  src={avatarUrl}
                  alt=""
                  className="relative h-full w-full rounded-full border-2 border-primary/20 object-cover shadow-glow"
                />
              </div>
              <div className="flex h-24 items-center gap-1" aria-hidden="true">
                {[0.5, 0.8, 0.4, 1, 0.6].map((scale, i) => (
                  <div
                    key={`right-${i}`}
                    className="w-1 animate-voice-bar rounded-full bg-gradient-to-t from-accent to-primary"
                    style={{ animationDelay: `${i * 0.15}s`, height: `${scale * 100}%` }}
                  />
                ))}
              </div>
            </div>
            <h2 className="text-center text-xl font-bold">{profile.displayName}</h2>
            <p className="text-center text-sm text-muted-foreground" dir="ltr">
              @{profile.username}
            </p>
            {profile.bio && <p className="mt-2 text-center text-sm text-muted-foreground">{profile.bio}</p>}
            <div className="mt-3 flex justify-center">
              <button
                onClick={openEditProfile}
                className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 text-xs font-medium transition-colors hover:bg-primary/20"
              >
                <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                {t("panel.editProfile")}
              </button>
            </div>
          </div>

          <section className="mb-6" aria-labelledby="panel-new-members">
            <h3 id="panel-new-members" className="mb-4 text-sm font-semibold">
              {t("panel.newMembers")}
            </h3>
            <ul className="space-y-3">
              {newMembers.map((member) => (
                <li key={member.name} className="flex items-center gap-3">
                  <div
                    aria-hidden="true"
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-primary/30 bg-gradient-primary text-lg"
                  >
                    {member.avatar}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{member.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatRelative(pageLoadedAt - member.minutesAgo * 60_000)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="panel-activity">
            <div className="mb-4 flex items-center justify-between">
              <h3 id="panel-activity" className="text-sm font-semibold">
                {t("panel.yourActivity")}
              </h3>
              {activity.length > 0 && (
                <button
                  onClick={clearActivity}
                  className="text-xs text-muted-foreground transition-colors hover:text-foreground"
                >
                  {t("activity.clear")}
                </button>
              )}
            </div>
            {activity.length === 0 ? (
              <p className="rounded-lg bg-secondary/40 p-3 text-xs text-muted-foreground">{t("panel.noActivity")}</p>
            ) : (
              <ul className="space-y-3">
                {activity.slice(0, 6).map((entry) => {
                  const display = activityDisplay[entry.type];
                  const text = t(display.text, { name: entry.communityName ? pick(entry.communityName) : "" });
                  const content = (
                    <>
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-accent/30 bg-gradient-accent text-primary-foreground">
                        <display.icon className="h-4 w-4" aria-hidden="true" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{text}</p>
                        <p className="text-xs text-muted-foreground">{formatRelative(entry.at)}</p>
                      </div>
                    </>
                  );
                  return (
                    <li key={entry.id}>
                      {entry.communityId && entry.type !== "left" ? (
                        <Link
                          to={`/community/${entry.communityId}`}
                          onClick={closeIfDrawer}
                          className="-m-1 flex items-center gap-3 rounded-lg p-1 transition-colors hover:bg-secondary/60"
                        >
                          {content}
                        </Link>
                      ) : (
                        <div className="flex items-center gap-3">{content}</div>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </div>

        {/* Settings Panel */}
        <div
          ref={settingsPanelRef}
          className={cn(
            "absolute inset-0 transition-transform duration-300 ease-out",
            activePanel === "settings" ? "translate-x-0" : "translate-x-full rtl:-translate-x-full",
          )}
        >
          <SettingsPanel onBack={() => setActivePanel("main")} />
        </div>

        {/* Notifications Panel */}
        <div
          ref={notificationsPanelRef}
          className={cn(
            "absolute inset-0 transition-transform duration-300 ease-out",
            activePanel === "notifications" ? "translate-x-0" : "translate-x-full rtl:-translate-x-full",
          )}
        >
          <NotificationsPanel
            notifications={notifications}
            onNotificationsChange={setNotifications}
            muted={muted}
            onMutedChange={setMuted}
            onBack={() => setActivePanel("main")}
          />
        </div>
      </aside>
    </>
  );
};
