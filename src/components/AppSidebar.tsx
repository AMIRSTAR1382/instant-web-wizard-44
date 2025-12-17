import { Home, Gamepad2, Music, Film, Code, Cpu, Settings, Headphones, Users } from "lucide-react";
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

export const AppSidebar = () => {
  const { open } = useSidebar();

  return (
    <Sidebar collapsible="icon" className="border-r-0 md:!left-[72px]">
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

        {/* Sound Bar Section - Colorful Equalizer */}
        <div className="border-t border-sidebar-border px-4 py-4">
          <div className="flex items-end justify-center gap-[2px] h-10">
            {[
              { color: '#9333ea', delay: 0.0 },
              { color: '#a855f7', delay: 0.1 },
              { color: '#c084fc', delay: 0.15 },
              { color: '#e879f9', delay: 0.2 },
              { color: '#f472b6', delay: 0.25 },
              { color: '#fb7185', delay: 0.3 },
              { color: '#f97316', delay: 0.35 },
              { color: '#facc15', delay: 0.4 },
              { color: '#a3e635', delay: 0.45 },
              { color: '#4ade80', delay: 0.5 },
              { color: '#2dd4bf', delay: 0.55 },
              { color: '#22d3ee', delay: 0.6 },
              { color: '#38bdf8', delay: 0.65 },
              { color: '#60a5fa', delay: 0.7 },
              { color: '#818cf8', delay: 0.75 },
              { color: '#a78bfa', delay: 0.8 },
            ].map((bar, i) => (
              <div
                key={i}
                className="w-1 rounded-full animate-voice-bar"
                style={{
                  backgroundColor: bar.color,
                  animationDelay: `${bar.delay}s`,
                  height: '100%',
                }}
              />
            ))}
          </div>
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
                  <button className="p-1.5 rounded-md hover:bg-sidebar-accent transition-colors text-muted-foreground hover:text-foreground">
                    <Headphones className="w-4 h-4" />
                  </button>
                  <button className="p-1.5 rounded-md hover:bg-sidebar-accent transition-colors text-muted-foreground hover:text-foreground">
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
