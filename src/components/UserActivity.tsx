import { useEffect, useRef, useState } from "react";
import { Bell, BellOff, Settings, X } from "lucide-react";
import { SettingsPanel } from "./user-activity/SettingsPanel";
import { NotificationsPanel } from "./user-activity/NotificationsPanel";
import { currentUser } from "@/data/currentUser";
import { initialNotifications } from "@/data/notifications";
import { useMediaQuery } from "@/hooks/use-media-query";
import { usePersistentState } from "@/hooks/use-persistent-state";

type Panel = "main" | "settings" | "notifications";

const newMembers = [
  { name: "Naruto Uzumaki", time: "3 min ago", avatar: "🦊" },
  { name: "Son Goku", time: "12 min ago", avatar: "🐉" },
  { name: "Monkey D. Luffy", time: "15 min ago", avatar: "🏴‍☠️" },
  { name: "Tanjiro Kamado", time: "30 min ago", avatar: "⚔️" },
];

const recentActivity = [
  { name: "Yumeko", action: "started following you", time: "1 hour ago" },
  { name: "Todoroki", action: "started following you", time: "3 hours ago" },
];

interface UserActivityProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const UserActivity = ({ isOpen = false, onClose }: UserActivityProps) => {
  const [activePanel, setActivePanel] = useState<Panel>("main");
  // Notifications live here (not inside NotificationsPanel) so the bell badge can read them too.
  const [notifications, setNotifications] = useState(initialNotifications);
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

  return (
    <>
      {isOpen && (
        <div
          aria-hidden="true"
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 xl:hidden"
          onClick={onClose}
        />
      )}

      <aside
        ref={asideRef}
        tabIndex={-1}
        aria-label="Profile and activity"
        className={`
          fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-card border-l border-border overflow-hidden z-50 outline-none
          transform transition-transform duration-300 ease-out
          xl:relative xl:max-w-none xl:translate-x-0
          ${isOpen ? "translate-x-0" : "translate-x-full"}
        `}
      >
        {/* Main Content */}
        <div
          ref={mainPanelRef}
          className={`absolute inset-0 p-6 overflow-y-auto transition-transform duration-300 ease-out ${
            activePanel !== "main" ? "-translate-x-full" : "translate-x-0"
          }`}
        >
          <div className="flex items-center justify-between xl:justify-end mb-8">
            {/* Close button lives in the header row so it can't cover the other buttons. */}
            <button
              onClick={onClose}
              aria-label="Close panel"
              className="xl:hidden w-8 h-8 rounded-full bg-secondary flex items-center justify-center hover:bg-primary/20 transition-all"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="flex gap-3">
              <button
                onClick={() => setActivePanel("notifications")}
                aria-label={showUnreadDot ? `Notifications, ${unreadCount} unread` : "Notifications"}
                className="w-8 h-8 rounded-full bg-card flex items-center justify-center hover:bg-secondary transition-colors hover:scale-110 duration-300 relative"
              >
                {muted ? <BellOff className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
                {showUnreadDot && (
                  <span
                    aria-hidden="true"
                    className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-primary rounded-full border border-card"
                  />
                )}
              </button>
              <button
                onClick={() => setActivePanel("settings")}
                aria-label="Settings"
                className="w-8 h-8 rounded-full bg-card flex items-center justify-center hover:bg-secondary transition-colors hover:rotate-90 duration-300"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="mb-8">
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="flex items-center gap-1 h-24" aria-hidden="true">
                {[0.6, 1, 0.4, 0.8, 0.5].map((scale, i) => (
                  <div
                    key={`left-${i}`}
                    className="w-1 bg-gradient-to-t from-primary to-accent rounded-full animate-voice-bar"
                    style={{ animationDelay: `${i * 0.1}s`, height: `${scale * 100}%` }}
                  />
                ))}
              </div>
              <div className="w-24 h-24 relative">
                <div className="absolute inset-0 bg-gradient-accent rounded-full blur-xl opacity-50 animate-pulse" />
                <img
                  src={currentUser.avatar}
                  alt=""
                  className="relative w-full h-full object-cover rounded-full shadow-glow border-2 border-primary/20"
                />
              </div>
              <div className="flex items-center gap-1 h-24" aria-hidden="true">
                {[0.5, 0.8, 0.4, 1, 0.6].map((scale, i) => (
                  <div
                    key={`right-${i}`}
                    className="w-1 bg-gradient-to-t from-accent to-primary rounded-full animate-voice-bar"
                    style={{ animationDelay: `${i * 0.15}s`, height: `${scale * 100}%` }}
                  />
                ))}
              </div>
            </div>
            <h2 className="text-center text-xl font-bold">{currentUser.displayName}</h2>
            <p className="text-center text-sm text-muted-foreground">{currentUser.username}</p>
          </div>

          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold">New Member</h3>
              <button className="text-xs text-muted-foreground hover:text-foreground transition-colors">See all</button>
            </div>
            <div className="space-y-3">
              {newMembers.map((member) => (
                <div key={member.name} className="flex items-center gap-3 group cursor-pointer animate-fade-in hover:translate-x-1 transition-all">
                  <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center text-lg group-hover:scale-110 transition-transform border border-primary/30">
                    {member.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{member.name}</p>
                    <p className="text-xs text-muted-foreground">{member.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold">Recent Activity</h3>
              <button className="text-xs text-muted-foreground hover:text-foreground transition-colors">See all</button>
            </div>
            <div className="space-y-3">
              {recentActivity.map((activity) => (
                <div key={activity.name} className="flex items-center gap-3 group cursor-pointer animate-fade-in hover:translate-x-1 transition-all">
                  <div className="w-10 h-10 rounded-full bg-gradient-accent flex items-center justify-center text-sm font-bold group-hover:scale-110 transition-transform border border-accent/30">
                    {activity.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{activity.name}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {activity.action} · {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Settings Panel */}
        <div
          ref={settingsPanelRef}
          className={`absolute inset-0 transition-transform duration-300 ease-out ${
            activePanel === "settings" ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <SettingsPanel onBack={() => setActivePanel("main")} />
        </div>

        {/* Notifications Panel */}
        <div
          ref={notificationsPanelRef}
          className={`absolute inset-0 transition-transform duration-300 ease-out ${
            activePanel === "notifications" ? "translate-x-0" : "translate-x-full"
          }`}
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
