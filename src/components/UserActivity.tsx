import userAvatar from "@/assets/user-avatar.jpg";
import { Bell, Settings } from "lucide-react";

const newMembers = [
  { name: "Naruto Uzumaki", time: "3 min ago", avatar: "🦊" },
  { name: "Son Goku", time: "12 min ago", avatar: "🐉" },
  { name: "Monkey D. Luffy", time: "15 min ago", avatar: "🏴‍☠️" },
  { name: "Tanjiro Kamado", time: "30 min ago", avatar: "⚔️" },
];

const recentActivity = [
  { name: "Yumeko", action: "started following you", time: "following you" },
  { name: "Todoroki", action: "started following you", time: "following you" },
];

export const UserActivity = () => {
  return (
    <aside className="w-80 bg-card border-l border-border p-6 overflow-y-auto hidden xl:block">
      <div className="flex items-center justify-between mb-8">
        <div className="w-10 h-10 rounded-full bg-card" />
        <div className="flex gap-3">
          <button className="w-8 h-8 rounded-full bg-card flex items-center justify-center hover:bg-secondary transition-colors">
            <Bell className="w-4 h-4" />
          </button>
          <button className="w-8 h-8 rounded-full bg-card flex items-center justify-center hover:bg-secondary transition-colors">
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="mb-8">
        <div className="w-24 h-24 mx-auto mb-4 relative">
          <div className="absolute inset-0 bg-gradient-accent rounded-full blur-xl opacity-50 animate-pulse" />
          <img 
            src={userAvatar} 
            alt="User Avatar"
            className="relative w-full h-full object-cover rounded-full shadow-glow border-2 border-primary/20"
          />
        </div>
        <h2 className="text-center text-xl font-bold">Md Amir Khan</h2>
        <p className="text-center text-sm text-muted-foreground">aamiiillliirrr</p>
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold">New Member</h3>
          <button className="text-xs text-muted-foreground hover:text-foreground transition-colors">
            See all
          </button>
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
          <button className="text-xs text-muted-foreground hover:text-foreground transition-colors">
            See all
          </button>
        </div>
        <div className="space-y-3">
          {recentActivity.map((activity) => (
            <div key={activity.name} className="flex items-center gap-3 group cursor-pointer animate-fade-in hover:translate-x-1 transition-all">
              <div className="w-10 h-10 rounded-full bg-gradient-accent flex items-center justify-center text-sm font-bold group-hover:scale-110 transition-transform border border-accent/30">
                {activity.name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{activity.name}</p>
                <p className="text-xs text-muted-foreground">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
};
