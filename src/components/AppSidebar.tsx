import { useState } from "react";
import { Compass, Headphones, HeadphoneOff, Home, Mic, MicOff, Users } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { usePreferences } from "@/context/PreferencesContext";
import { useProfile } from "@/context/ProfileContext";
import { useCommunities } from "@/context/CommunitiesContext";
import { categories, getCommunityImage } from "@/data/communities";
import { usePersistentState } from "@/hooks/use-persistent-state";
import { cn } from "@/lib/utils";

// Sample voice room until real voice chat exists.
const voiceParticipants = [
  { id: 1, name: "Alex", color: "from-primary to-accent", isSpeaking: true, isMuted: false },
  { id: 2, name: "Sarah", color: "from-pink-500 to-orange-400", isSpeaking: false, isMuted: false },
  { id: 3, name: "Mike", color: "from-emerald-500 to-cyan-500", isSpeaking: false, isMuted: true },
];

const navButtonClass =
  "h-11 gap-3 px-3 rounded-lg text-muted-foreground transition-all hover:bg-sidebar-accent hover:text-foreground data-[active=true]:bg-primary/20 data-[active=true]:text-primary";

export const AppSidebar = () => {
  const { isMobile, setOpenMobile } = useSidebar();
  const { pathname } = useLocation();
  const { t, pick, dir } = usePreferences();
  const { profile, avatarUrl } = useProfile();
  const { joinedCommunities } = useCommunities();
  const [showOnlineStatus] = usePersistentState("settings.showOnlineStatus", true);
  const [participantsOpen, setParticipantsOpen] = useState(true);
  const [voiceActive, setVoiceActive] = useState(true);

  const showParticipants = voiceActive && participantsOpen;
  // On phones the sidebar is a sheet over the page: close it once a page is picked.
  const closeOnMobile = () => {
    if (isMobile) setOpenMobile(false);
  };

  const navItems = [
    { icon: Home, label: t("nav.home"), path: "/" },
    { icon: Compass, label: t("nav.explore"), path: "/explore" },
    ...categories.map((category) => ({ icon: category.icon, label: pick(category.name), path: `/${category.id}` })),
  ];

  return (
    <Sidebar
      side={dir === "rtl" ? "right" : "left"}
      collapsible="offcanvas"
      className={cn(
        "border-x-0",
        dir === "rtl"
          ? "md:right-[72px] md:group-data-[collapsible=offcanvas]:right-[calc((var(--sidebar-width)+72px)*-1)]"
          : "md:left-[72px] md:group-data-[collapsible=offcanvas]:left-[calc((var(--sidebar-width)+72px)*-1)]",
      )}
    >
      <SidebarContent className="flex h-full flex-col">
        <div className="px-4 py-4">
          <p className="text-xl font-semibold text-foreground">{t("app.name")}</p>
        </div>

        <nav aria-label={t("nav.categories")} className="flex-1 overflow-y-auto px-2">
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.path}>
                {/* Active styling goes through `isActive` (data-active): Slot merges className as a
                    plain string, so NavLink's function form of className can't be used here. */}
                <SidebarMenuButton asChild isActive={pathname === item.path} className={navButtonClass}>
                  <NavLink to={item.path} end onClick={closeOnMobile}>
                    <item.icon className="shrink-0" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>

          {/* The rail with joined communities is hidden on phones, so list them here instead. */}
          {joinedCommunities.length > 0 && (
            <div className="mt-4 md:hidden">
              <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {t("nav.yourCommunities")}
              </p>
              <SidebarMenu>
                {joinedCommunities.map((community) => {
                  const path = `/community/${community.id}`;
                  return (
                    <SidebarMenuItem key={community.id}>
                      <SidebarMenuButton asChild isActive={pathname === path} className={navButtonClass}>
                        <NavLink to={path} onClick={closeOnMobile}>
                          <img src={getCommunityImage(community.image)} alt="" className="h-6 w-6 shrink-0 rounded-full object-cover" />
                          <span className="text-sm font-medium">{pick(community.name)}</span>
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </div>
          )}
        </nav>

        {/* Voice room */}
        <div className="border-t border-sidebar-border">
          <div className="flex items-center gap-2 px-4 py-3 text-muted-foreground">
            {voiceActive ? (
              <div className="flex h-4 items-end gap-0.5" aria-hidden="true">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="w-0.5 animate-voice-bar rounded-full bg-primary"
                    style={{ animationDelay: `${i * 0.1}s`, height: "100%" }}
                  />
                ))}
              </div>
            ) : (
              <MicOff className="h-4 w-4" aria-hidden="true" />
            )}
            <span className="text-sm">{voiceActive ? t("voice.active") : t("voice.muted")}</span>
          </div>

          {showParticipants && (
            <div className="space-y-2 px-4 pb-3">
              <p className="mb-2 text-xs text-muted-foreground">{t("voice.inRoom")}</p>
              {voiceParticipants.map((participant) => (
                <div
                  key={participant.id}
                  className="flex items-center gap-2 rounded-md px-2 py-1.5 transition-colors hover:bg-sidebar-accent"
                >
                  <div className="relative">
                    <div
                      aria-hidden="true"
                      className={cn(
                        "flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br text-xs font-bold text-white",
                        participant.color,
                        participant.isSpeaking && "ring-2 ring-primary",
                      )}
                    >
                      {participant.name[0]}
                    </div>
                    {participant.isSpeaking && (
                      <div className="absolute -bottom-0.5 -end-0.5 h-2.5 w-2.5 rounded-full border border-sidebar-background bg-primary" />
                    )}
                  </div>
                  <span className="flex-1 text-sm text-foreground">{participant.name}</span>
                  {participant.isMuted ? (
                    <MicOff className="h-3.5 w-3.5 text-muted-foreground" aria-label={t("voice.mutedUser")} />
                  ) : (
                    <Mic className="h-3.5 w-3.5 text-muted-foreground" aria-label={t("voice.unmutedUser")} />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Profile */}
        <div className="border-t border-sidebar-border p-3">
          <div className="flex items-center gap-3">
            <div className="relative shrink-0">
              <img src={avatarUrl} alt="" className="h-10 w-10 rounded-full object-cover ring-2 ring-primary/50" />
              {showOnlineStatus && (
                <div
                  className="absolute -bottom-0.5 -end-0.5 h-3.5 w-3.5 rounded-full border-2 border-sidebar-background bg-green-500"
                  title={t("voice.online")}
                />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">{profile.displayName}</p>
              <p className="truncate text-xs text-muted-foreground" dir="ltr">
                @{profile.username}
              </p>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setVoiceActive(!voiceActive)}
                aria-pressed={voiceActive}
                aria-label={voiceActive ? t("voice.disconnect") : t("voice.connect")}
                title={voiceActive ? t("voice.disconnect") : t("voice.connect")}
                className={cn(
                  "rounded-md p-1.5 transition-colors",
                  voiceActive
                    ? "bg-primary/20 text-primary hover:bg-primary/30"
                    : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground",
                )}
              >
                {voiceActive ? <Headphones className="h-4 w-4" /> : <HeadphoneOff className="h-4 w-4" />}
              </button>
              <button
                onClick={() => setParticipantsOpen(!participantsOpen)}
                disabled={!voiceActive}
                aria-pressed={showParticipants}
                aria-label={participantsOpen ? t("voice.hideParticipants") : t("voice.showParticipants")}
                title={participantsOpen ? t("voice.hideParticipants") : t("voice.showParticipants")}
                className={cn(
                  "rounded-md p-1.5 transition-colors disabled:pointer-events-none disabled:opacity-40",
                  showParticipants
                    ? "bg-primary/20 text-primary hover:bg-primary/30"
                    : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground",
                )}
              >
                <Users className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </SidebarContent>
    </Sidebar>
  );
};
