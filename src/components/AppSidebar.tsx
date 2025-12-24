import { useState } from "react";
import { Home, Gamepad2, Music, Film, Code, Cpu, Settings, Headphones, HeadphoneOff, Users, ChevronUp, ChevronDown, MicOff, Mic } from "lucide-react";
import { NavLink } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import userAvatar from "@/assets/user-avatar.jpg";

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
  const { open } = useSidebar();
  const [soundBarOpen, setSoundBarOpen] = useState(true);
  const [voiceActive, setVoiceActive] = useState(true);

  return (
    <Sidebar
      collapsible="offcanvas"
      className="border-r-0 md:left-[72px] md:group-data-[collapsible=offcanvas]:left-[calc((var(--sidebar-width)+72px)*-1)]"
    >
      <SidebarContent className="flex flex-col h-full">
        {/* Header */}
        <div className="px-4 py-4">
          {open && (
            <h1 className="text-xl font-semibold text-foreground">Explore</h1>
          )}
          {!open && (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-sm font-bold text-primary-foreground">
              E
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex-1 px-2">
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.label}>
                <SidebarMenuButton asChild className="h-11">
                  <NavLink
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                        isActive
                          ? "bg-primary/20 text-primary"
                          : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
                      }`
                    }
                  >
                    <item.icon className="w-5 h-5 shrink-0" />
                    {open && <span className="text-sm font-medium">{item.label}</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </div>

        {/* Sound Bar Section */}
        <div className="border-t border-sidebar-border">
          {open && (
            <div className="flex items-center justify-between px-4 py-3">
              <button 
                onClick={() => setSoundBarOpen(!soundBarOpen)}
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                {voiceActive ? (
                  <div className="flex items-end gap-0.5 h-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className="w-0.5 bg-primary rounded-full animate-voice-bar"
                        style={{
                          animationDelay: `${i * 0.1}s`,
                          height: '100%',
                        }}
                      />
                    ))}
                  </div>
                ) : (
                  <MicOff className="w-4 h-4 text-muted-foreground" />
                )}
                <span className="text-sm">{voiceActive ? 'Voice Active' : 'Voice Muted'}</span>
                
              </button>
            </div>
          )}
          {!open && (
            <button 
              onClick={() => setVoiceActive(!voiceActive)}
              className="w-full flex justify-center py-3 hover:bg-sidebar-accent transition-colors"
            >
              {voiceActive ? (
                <div className="flex items-end gap-0.5 h-4">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="w-0.5 bg-primary rounded-full animate-voice-bar"
                      style={{
                        animationDelay: `${i * 0.1}s`,
                        height: '100%',
                      }}
                    />
                  ))}
                </div>
              ) : (
                <MicOff className="w-4 h-4 text-muted-foreground" />
              )}
            </button>
          )}
          {open && soundBarOpen && (
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
                      alt={participant.name}
                      className={`w-7 h-7 rounded-full object-cover ${participant.isSpeaking ? 'ring-2 ring-primary' : ''}`}
                    />
                    {participant.isSpeaking && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-primary rounded-full border border-sidebar-background" />
                    )}
                  </div>
                  <span className="text-sm text-foreground flex-1">{participant.name}</span>
                  {participant.isMuted ? (
                    <MicOff className="w-3.5 h-3.5 text-muted-foreground" />
                  ) : (
                    <Mic className="w-3.5 h-3.5 text-muted-foreground" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* User Profile Section */}
        <div className="border-t border-sidebar-border p-3">
          <div className={`flex items-center ${open ? 'gap-3' : 'justify-center'}`}>
            <div className="relative shrink-0">
              <img
                src={userAvatar}
                alt="User avatar"
                className="w-10 h-10 rounded-full object-cover ring-2 ring-primary/50"
              />
              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-sidebar-background" />
            </div>
            {open && (
              <>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">aamiiiiiiiirrr</p>
                </div>
                <div className="flex items-center gap-1">
                  <button className="p-1.5 rounded-md hover:bg-sidebar-accent transition-colors text-muted-foreground hover:text-foreground">
                    <Settings className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => setVoiceActive(!voiceActive)}
                    className={`p-1.5 rounded-md transition-colors ${
                      voiceActive 
                        ? 'bg-primary/20 text-primary hover:bg-primary/30' 
                        : 'hover:bg-sidebar-accent text-muted-foreground hover:text-foreground'
                    }`}
                    title={voiceActive ? 'Disconnect Voice' : 'Connect Voice'}
                  >
                    {voiceActive ? <Headphones className="w-4 h-4" /> : <HeadphoneOff className="w-4 h-4" />}
                  </button>
                  <button 
                    onClick={() => setSoundBarOpen(!soundBarOpen)}
                    className={`p-1.5 rounded-md transition-colors ${
                      soundBarOpen && voiceActive
                        ? 'bg-primary/20 text-primary hover:bg-primary/30' 
                        : 'hover:bg-sidebar-accent text-muted-foreground hover:text-foreground'
                    }`}
                    title={soundBarOpen ? 'Hide Participants' : 'Show Participants'}
                  >
                    <Users className="w-4 h-4" />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </SidebarContent>
    </Sidebar>
  );
};
