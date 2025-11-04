import { Home, Gamepad2, Music, Film, Code, Cpu } from "lucide-react";
import { NavLink } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

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
    <Sidebar collapsible="icon">
      <SidebarContent>
        <div className="flex items-center justify-center py-6">
          <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center text-lg font-bold animate-pulse">
            E
          </div>
        </div>

        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.label}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.path}
                      className={({ isActive }) =>
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-sidebar-accent"
                      }
                    >
                      <item.icon className="w-5 h-5" />
                      {open && <span>{item.label}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};
