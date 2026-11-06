import { useState } from "react";
import { Home, Gamepad2, Music, Film, Code, Cpu, Headphones, HeadphoneOff, Users, MicOff, Mic } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { currentUser } from "@/data/currentUser";

const navItems = [
  { icon: Home, label: "Home", path: "/" },
  { icon: Gamepad2, label: "Gaming", path: "/gaming" },
  { icon: Music, label: "Music", path: "/music" },
  { icon: Film, label: "Entertainment", path: "/entertainment" },
  { icon: Code, label: "Coding", path: "/coding" },
  { icon: Cpu, label: "Technology", path: "/technology" },
];

const voiceParticipants = [
  { id: 1, name: "Alex", avatar: "https://i.pravatar.cc/150?img=1", isSpeaking: true, isMuted: false },
  { id: 2, name: "Sarah", avatar: "https://i.pravatar.cc/150?img=2", isSpeaking: false, isMuted: false },
  { id: 3, name: "Mike", avatar: "https://i.pravatar.cc/150?img=3", isSpeaking: false, isMuted: true },
];

export const AppSidebar = () => {
  const { isMobile, setOpenMobile } = useSidebar();
  const { pathname } = useLocation();
  const [participantsOpen, setParticipantsOpen] = useState(true);
  const [voiceActive, setVoiceActive] = useState(true);

  const showParticipants = voiceActive && participantsOpen;

  return (
    <Sidebar
      collapsible="offcanvas"
      className="border-r-0 md:left-[72px] md:group-data-[collapsible=offcanvas]:left-[calc((var(--sidebar-width)+72px)*-1)]"
    >
      <SidebarContent className="flex flex-col h-full">
        {/* Header */}
        <div className="px-4 py-4">
          <h1 className="text-xl font-semibold text-foreground">Explore</h1>
        </div>

        {/* Navigation */}
        <nav aria-label="Categories" className="flex-1 px-2">
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.path}>
                {/* Active styling goes through `isActive` (data-active): Slot merges className as a
                    plain string, so NavLink's function form of className can't be used here. */}
                <SidebarMenuButton
                  asChild
                  isActive={pathname === item.path}
                  className="h-11 gap-3 px-3 rounded-lg text-muted-foreground transition-all hover:bg-sidebar-accent hover:text-foreground data-[active=true]:bg-primary/20 data-[active=true]:text-primary"
                >
                  <NavLink
                    to={item.path}
                    end
                    onClick={() => {
                      // On phones the sidebar is a sheet over the page: close it once a page is picked.
                      if (isMobile) setOpenMobile(false);
                    }}
                  >
                    <item.icon className="shrink-0" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </nav>

        {/* Voice Section */}
        <div className="border-t border-sidebar-border">
          <div className="flex items-center gap-2 px-4 py-3 text-muted-foreground">
            {voiceActive ? (
              <div className="flex items-end gap-0.5 h-4" aria-hidden="true">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="w-0.5 bg-primary rounded-full animate-voice-bar"
                    style={{
                      animationDelay: `${i * 0.1}s`,
                      height: "100%",
                    }}
                  />
                ))}
              </div>
            ) : (
              <MicOff className="w-4 h-4" aria-hidden="true" />
            )}
            <span className="text-sm">{voiceActive ? "Voice Active" : "Voice Muted"}</span>
          </div>

          {showParticipants && (
            <div className="px-4 pb-3 space-y-2">
              <p className="text-xs text-muted-foreground mb-2">In this room</p>
              {voiceParticipants.map((participant) => (
                <div
                  key={participant.id}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-sidebar-accent transition-colors"
                >
                  <div className="relative">
                    <img
                      src={participant.avatar}
                      alt=""
                      className={`w-7 h-7 rounded-full object-cover ${participant.isSpeaking ? "ring-2 ring-primary" : ""}`}
                    />
                    {participant.isSpeaking && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-primary rounded-full border border-sidebar-background" />
                    )}
                  </div>
                  <span className="text-sm text-foreground flex-1">{participant.name}</span>
                  {participant.isMuted ? (
                    <MicOff className="w-3.5 h-3.5 text-muted-foreground" aria-label="Muted" />
                  ) : (
                    <Mic className="w-3.5 h-3.5 text-muted-foreground" aria-label="Unmuted" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* User Profile Section */}
        <div className="border-t border-sidebar-border p-3">
          <div className="flex items-center gap-3">
            <div className="relative shrink-0">
              <img
                src={currentUser.avatar}
                alt=""
                className="w-10 h-10 rounded-full object-cover ring-2 ring-primary/50"
              />
              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-sidebar-background" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{currentUser.username}</p>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setVoiceActive(!voiceActive)}
                aria-pressed={voiceActive}
                aria-label={voiceActive ? "Disconnect voice" : "Connect voice"}
                title={voiceActive ? "Disconnect Voice" : "Connect Voice"}
                className={`p-1.5 rounded-md transition-colors ${
                  voiceActive
                    ? "bg-primary/20 text-primary hover:bg-primary/30"
                    : "hover:bg-sidebar-accent text-muted-foreground hover:text-foreground"
                }`}
              >
                {voiceActive ? <Headphones className="w-4 h-4" /> : <HeadphoneOff className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setParticipantsOpen(!participantsOpen)}
                disabled={!voiceActive}
                aria-pressed={showParticipants}
                aria-label={participantsOpen ? "Hide participants" : "Show participants"}
                title={participantsOpen ? "Hide Participants" : "Show Participants"}
                className={`p-1.5 rounded-md transition-colors disabled:opacity-40 disabled:pointer-events-none ${
                  showParticipants
                    ? "bg-primary/20 text-primary hover:bg-primary/30"
                    : "hover:bg-sidebar-accent text-muted-foreground hover:text-foreground"
                }`}
              >
                <Users className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </SidebarContent>
    </Sidebar>
  );
};
