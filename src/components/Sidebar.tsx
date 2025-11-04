import { Home, Gamepad2, Music, Film, Code, Cpu } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { icon: Home, label: "Home", active: true },
  { icon: Gamepad2, label: "Gaming" },
  { icon: Music, label: "Music" },
  { icon: Film, label: "Entertainment" },
  { icon: Code, label: "Coding" },
  { icon: Cpu, label: "Technology" },
];

export const Sidebar = () => {
  return (
    <aside className="fixed left-0 top-0 h-screen w-16 bg-sidebar border-r border-sidebar-border flex flex-col items-center py-4 space-y-4">
      <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center text-sm font-bold mb-4">
        E
      </div>
      
      {navItems.map((item) => (
        <button
          key={item.label}
          className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 hover:bg-sidebar-accent group relative",
            item.active && "bg-primary text-primary-foreground"
          )}
          title={item.label}
        >
          <item.icon className="w-5 h-5" />
          <span className="absolute left-full ml-3 px-2 py-1 bg-card rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
            {item.label}
          </span>
        </button>
      ))}
    </aside>
  );
};
