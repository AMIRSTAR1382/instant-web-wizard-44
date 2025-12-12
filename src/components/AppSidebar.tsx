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

        {/* User Profile Section */}
        <div className="mt-auto border-t border-sidebar-border p-3">
          <div className="flex items-center gap-3">
            <div className="relative">
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