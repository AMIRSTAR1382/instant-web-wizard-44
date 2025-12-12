import { useState } from "react";
import userAvatar from "@/assets/user-avatar.jpg";
import { Bell, Settings, ArrowLeft, User, Shield, Palette, Volume2, Globe, UserPlus, Heart, MessageCircle, AtSign, X } from "lucide-react";

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

const settingsOptions = [
  { icon: User, label: "My Account", description: "Manage your account settings" },
  { icon: Shield, label: "Privacy & Safety", description: "Control your privacy" },
  { icon: Palette, label: "Appearance", description: "Customize how the app looks" },
  { icon: Volume2, label: "Voice & Audio", description: "Audio and voice settings" },
  { icon: Globe, label: "Language", description: "Change your language" },
];

const notifications = [
  { icon: UserPlus, title: "New follower", description: "Sasuke started following you", time: "2 min ago" },
  { icon: Heart, title: "New like", description: "Hinata liked your post", time: "5 min ago" },
  { icon: MessageCircle, title: "New message", description: "Kakashi sent you a message", time: "10 min ago" },
  { icon: AtSign, title: "Mention", description: "You were mentioned in Gaming", time: "15 min ago" },
  { icon: UserPlus, title: "New follower", description: "Itachi started following you", time: "1 hour ago" },
];

interface UserActivityProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const UserActivity = ({ isOpen = false, onClose }: UserActivityProps) => {
  const [activePanel, setActivePanel] = useState<"main" | "settings" | "notifications">("main");

  return (
    <>
      {/* Overlay for mobile/tablet */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 xl:hidden"
          onClick={onClose}
        />
      )}
      
      <aside 
        className={`
          fixed top-0 right-0 h-full w-80 bg-card border-l border-border overflow-hidden z-50
          transform transition-transform duration-300 ease-out
          xl:relative xl:translate-x-0 xl:block
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        {/* Close button for mobile/tablet */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-secondary flex items-center justify-center hover:bg-primary/20 transition-all xl:hidden z-10"
        >
          <X className="w-4 h-4" />
        </button>
        {/* Main Content */}
      <div 
        className={`absolute inset-0 p-6 overflow-y-auto transition-transform duration-300 ease-out ${
          activePanel !== "main" ? "-translate-x-full" : "translate-x-0"
        }`}
      >
        <div className="flex items-center justify-between mb-8">
          <div className="w-10 h-10 rounded-full bg-card" />
          <div className="flex gap-3">
            <button 
              onClick={() => setActivePanel("notifications")}
              className="w-8 h-8 rounded-full bg-card flex items-center justify-center hover:bg-secondary transition-colors hover:scale-110 duration-300"
            >
              <Bell className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setActivePanel("settings")}
              className="w-8 h-8 rounded-full bg-card flex items-center justify-center hover:bg-secondary transition-colors hover:rotate-90 duration-300"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-center gap-4 mb-4">
            {/* Left audio bars */}
            <div className="flex items-center gap-1 h-24">
              {[0.6, 1, 0.4, 0.8, 0.5].map((scale, i) => (
                <div
                  key={`left-${i}`}
                  className="w-1 bg-gradient-to-t from-primary to-accent rounded-full animate-voice-bar"
                  style={{
                    animationDelay: `${i * 0.1}s`,
                    height: `${scale * 100}%`,
                  }}
                />
              ))}
            </div>

            {/* Avatar */}
            <div className="w-24 h-24 relative">
              <div className="absolute inset-0 bg-gradient-accent rounded-full blur-xl opacity-50 animate-pulse" />
              <img 
                src={userAvatar} 
                alt="User Avatar"
                className="relative w-full h-full object-cover rounded-full shadow-glow border-2 border-primary/20"
              />
            </div>

            {/* Right audio bars */}
            <div className="flex items-center gap-1 h-24">
              {[0.5, 0.8, 0.4, 1, 0.6].map((scale, i) => (
                <div
                  key={`right-${i}`}
                  className="w-1 bg-gradient-to-t from-accent to-primary rounded-full animate-voice-bar"
                  style={{
                    animationDelay: `${i * 0.15}s`,
                    height: `${scale * 100}%`,
                  }}
                />
              ))}
            </div>
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
      </div>

      {/* Settings Panel */}
      <div 
        className={`absolute inset-0 p-6 overflow-y-auto transition-transform duration-300 ease-out ${
          activePanel === "settings" ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center gap-3 mb-8">
          <button 
            onClick={() => setActivePanel("main")}
            className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center hover:bg-primary/20 transition-all hover:-translate-x-1 duration-200"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h2 className="text-lg font-bold">Settings</h2>
        </div>

        <div className="space-y-2">
          {settingsOptions.map((option, index) => (
            <button
              key={option.label}
              className="w-full flex items-center gap-4 p-3 rounded-lg hover:bg-secondary/80 transition-all group animate-fade-in"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                <option.icon className="w-5 h-5" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium">{option.label}</p>
                <p className="text-xs text-muted-foreground">{option.description}</p>
              </div>
            </button>
          ))}
        </div>

        <div className="mt-8 pt-6 border-t border-border">
          <button className="w-full py-3 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors text-sm font-medium">
            Log Out
          </button>
        </div>
      </div>

      {/* Notifications Panel */}
      <div 
        className={`absolute inset-0 p-6 overflow-y-auto transition-transform duration-300 ease-out ${
          activePanel === "notifications" ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center gap-3 mb-8">
          <button 
            onClick={() => setActivePanel("main")}
            className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center hover:bg-primary/20 transition-all hover:-translate-x-1 duration-200"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h2 className="text-lg font-bold">Notifications</h2>
        </div>

        <div className="space-y-3">
          {notifications.map((notification, index) => (
            <div
              key={index}
              className="flex items-start gap-4 p-3 rounded-lg hover:bg-secondary/80 transition-all group animate-fade-in cursor-pointer"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="w-10 h-10 rounded-full bg-gradient-accent flex items-center justify-center group-hover:scale-110 transition-transform">
                <notification.icon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{notification.title}</p>
                <p className="text-xs text-muted-foreground truncate">{notification.description}</p>
                <p className="text-xs text-muted-foreground/60 mt-1">{notification.time}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 pt-6 border-t border-border">
          <button className="w-full py-3 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors text-sm font-medium">
            Mark all as read
          </button>
        </div>
      </div>
      </aside>
    </>
  );
};
