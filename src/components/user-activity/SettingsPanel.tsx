import { useState } from "react";
import {
  ArrowLeft, User, Shield, Palette, Volume2, Globe,
  Eye, EyeOff, Lock, Bell, BellOff, Moon, Sun, Monitor,
  ChevronRight, Check, Mic, Speaker
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";

type SettingsView = "main" | "account" | "privacy" | "appearance" | "voice" | "language";

const languages = [
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "fa", label: "فارسی", flag: "🇮🇷" },
  { code: "ar", label: "العربية", flag: "🇸🇦" },
  { code: "ja", label: "日本語", flag: "🇯🇵" },
  { code: "ko", label: "한국어", flag: "🇰🇷" },
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "de", label: "Deutsch", flag: "🇩🇪" },
];

const themes = [
  { id: "dark", label: "Dark", icon: Moon, active: true },
  { id: "light", label: "Light", icon: Sun, active: false },
  { id: "system", label: "System", icon: Monitor, active: false },
];

interface SettingsPanelProps {
  onBack: () => void;
}

export const SettingsPanel = ({ onBack }: SettingsPanelProps) => {
  const [view, setView] = useState<SettingsView>("main");
  const [selectedLang, setSelectedLang] = useState("en");
  const [selectedTheme, setSelectedTheme] = useState("dark");

  // Privacy toggles
  const [showOnlineStatus, setShowOnlineStatus] = useState(true);
  const [showActivity, setShowActivity] = useState(true);
  const [allowDMs, setAllowDMs] = useState(true);
  const [readReceipts, setReadReceipts] = useState(false);

  // Voice settings
  const [inputVolume, setInputVolume] = useState([75]);
  const [outputVolume, setOutputVolume] = useState([80]);
  const [noiseSuppression, setNoiseSuppression] = useState(true);
  const [echoCancellation, setEchoCancellation] = useState(true);
  const [autoGainControl, setAutoGainControl] = useState(true);

  // Appearance
  const [compactMode, setCompactMode] = useState(false);
  const [animationsEnabled, setAnimationsEnabled] = useState(true);

  // Notification settings for account
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [pushNotifs, setPushNotifs] = useState(true);

  const settingsOptions = [
    { icon: User, label: "My Account", description: "Manage your account settings", view: "account" as SettingsView },
    { icon: Shield, label: "Privacy & Safety", description: "Control your privacy", view: "privacy" as SettingsView },
    { icon: Palette, label: "Appearance", description: "Customize how the app looks", view: "appearance" as SettingsView },
    { icon: Volume2, label: "Voice & Audio", description: "Audio and voice settings", view: "voice" as SettingsView },
    { icon: Globe, label: "Language", description: "Change your language", view: "language" as SettingsView },
  ];

  const handleBack = () => {
    if (view === "main") {
      onBack();
    } else {
      setView("main");
    }
  };

  const getTitle = () => {
    switch (view) {
      case "account": return "My Account";
      case "privacy": return "Privacy & Safety";
      case "appearance": return "Appearance";
      case "voice": return "Voice & Audio";
      case "language": return "Language";
      default: return "Settings";
    }
  };

  return (
    <div className="absolute inset-0 p-6 overflow-y-auto">
      <div className="flex items-center gap-3 mb-8">
        <button
          onClick={handleBack}
          className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center hover:bg-primary/20 transition-all hover:-translate-x-1 duration-200"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h2 className="text-lg font-bold">{getTitle()}</h2>
      </div>

      {/* Main Settings List */}
      {view === "main" && (
        <>
          <div className="space-y-2">
            {settingsOptions.map((option, index) => (
              <button
                key={option.label}
                onClick={() => setView(option.view)}
                className="w-full flex items-center gap-4 p-3 rounded-lg hover:bg-secondary/80 transition-all group animate-fade-in"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <option.icon className="w-5 h-5" />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium">{option.label}</p>
                  <p className="text-xs text-muted-foreground">{option.description}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
              </button>
            ))}
          </div>

          <div className="mt-8 pt-6 border-t border-border">
            <button className="w-full py-3 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors text-sm font-medium">
              Log Out
            </button>
          </div>
        </>
      )}

      {/* Account Sub-Panel */}
      {view === "account" && (
        <div className="space-y-6 animate-fade-in">
          {/* Profile Card */}
          <div className="bg-secondary/50 rounded-xl p-4">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-2xl font-bold text-primary-foreground">
                A
              </div>
              <div>
                <p className="font-semibold">Md Amir Khan</p>
                <p className="text-sm text-muted-foreground">aamiiillliirrr</p>
              </div>
            </div>
            <button className="w-full py-2 rounded-lg bg-primary/20 text-primary hover:bg-primary/30 transition-colors text-sm font-medium">
              Edit Profile
            </button>
          </div>

          {/* Account Info */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Account Info</h3>
            <div className="bg-secondary/30 rounded-lg p-3">
              <p className="text-xs text-muted-foreground">Username</p>
              <p className="text-sm font-medium">aamiiillliirrr</p>
            </div>
            <div className="bg-secondary/30 rounded-lg p-3">
              <p className="text-xs text-muted-foreground">Email</p>
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">a***@gmail.com</p>
                <Eye className="w-4 h-4 text-muted-foreground cursor-pointer hover:text-foreground transition-colors" />
              </div>
            </div>
            <div className="bg-secondary/30 rounded-lg p-3">
              <p className="text-xs text-muted-foreground">Phone</p>
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">+98 ***-***-4567</p>
                <Eye className="w-4 h-4 text-muted-foreground cursor-pointer hover:text-foreground transition-colors" />
              </div>
            </div>
          </div>

          {/* Notifications Preferences */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Notifications</h3>
            <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
              <div className="flex items-center gap-3">
                <Bell className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">Email Notifications</span>
              </div>
              <Switch checked={emailNotifs} onCheckedChange={setEmailNotifs} />
            </div>
            <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
              <div className="flex items-center gap-3">
                <Bell className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">Push Notifications</span>
              </div>
              <Switch checked={pushNotifs} onCheckedChange={setPushNotifs} />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Security</h3>
            <button className="w-full flex items-center gap-3 p-3 bg-secondary/30 rounded-lg hover:bg-secondary/50 transition-colors">
              <Lock className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">Change Password</span>
              <ChevronRight className="w-4 h-4 text-muted-foreground ml-auto" />
            </button>
          </div>
        </div>
      )}

      {/* Privacy Sub-Panel */}
      {view === "privacy" && (
        <div className="space-y-6 animate-fade-in">
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Activity Status</h3>
            <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
              <div className="flex items-center gap-3">
                <Eye className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-sm">Show Online Status</p>
                  <p className="text-xs text-muted-foreground">Others can see when you're online</p>
                </div>
              </div>
              <Switch checked={showOnlineStatus} onCheckedChange={setShowOnlineStatus} />
            </div>
            <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
              <div className="flex items-center gap-3">
                <Eye className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-sm">Show Current Activity</p>
                  <p className="text-xs text-muted-foreground">Display what you're doing</p>
                </div>
              </div>
              <Switch checked={showActivity} onCheckedChange={setShowActivity} />
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Direct Messages</h3>
            <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
              <div className="flex items-center gap-3">
                <Lock className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-sm">Allow Direct Messages</p>
                  <p className="text-xs text-muted-foreground">From community members</p>
                </div>
              </div>
              <Switch checked={allowDMs} onCheckedChange={setAllowDMs} />
            </div>
            <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
              <div className="flex items-center gap-3">
                <EyeOff className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-sm">Read Receipts</p>
                  <p className="text-xs text-muted-foreground">Show when you've read messages</p>
                </div>
              </div>
              <Switch checked={readReceipts} onCheckedChange={setReadReceipts} />
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Blocked Users</h3>
            <div className="p-4 bg-secondary/30 rounded-lg text-center">
              <Shield className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No blocked users</p>
              <p className="text-xs text-muted-foreground/60 mt-1">Users you block won't be able to message you</p>
            </div>
          </div>
        </div>
      )}

      {/* Appearance Sub-Panel */}
      {view === "appearance" && (
        <div className="space-y-6 animate-fade-in">
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Theme</h3>
            <div className="grid grid-cols-3 gap-2">
              {themes.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => setSelectedTheme(theme.id)}
                  className={`flex flex-col items-center gap-2 p-3 rounded-lg border transition-all ${
                    selectedTheme === theme.id
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50 bg-secondary/30"
                  }`}
                >
                  <theme.icon className={`w-5 h-5 ${selectedTheme === theme.id ? "text-primary" : "text-muted-foreground"}`} />
                  <span className={`text-xs ${selectedTheme === theme.id ? "text-primary font-medium" : "text-muted-foreground"}`}>
                    {theme.label}
                  </span>
                  {selectedTheme === theme.id && (
                    <Check className="w-3 h-3 text-primary" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Display</h3>
            <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
              <div>
                <p className="text-sm">Compact Mode</p>
                <p className="text-xs text-muted-foreground">Reduce spacing between items</p>
              </div>
              <Switch checked={compactMode} onCheckedChange={setCompactMode} />
            </div>
            <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
              <div>
                <p className="text-sm">Animations</p>
                <p className="text-xs text-muted-foreground">Enable motion effects</p>
              </div>
              <Switch checked={animationsEnabled} onCheckedChange={setAnimationsEnabled} />
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Preview</h3>
            <div className={`p-4 rounded-lg border border-border ${selectedTheme === 'light' ? 'bg-white text-black' : 'bg-secondary/50'}`}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent" />
                <div>
                  <p className="text-sm font-medium">Sample User</p>
                  <p className="text-xs opacity-60">Just now</p>
                </div>
              </div>
              <p className="text-sm opacity-80">This is how your messages will look with the selected theme.</p>
            </div>
          </div>
        </div>
      )}

      {/* Voice & Audio Sub-Panel */}
      {view === "voice" && (
        <div className="space-y-6 animate-fade-in">
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Input</h3>
            <div className="p-4 bg-secondary/30 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Mic className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">Input Volume</span>
                </div>
                <span className="text-xs text-muted-foreground">{inputVolume[0]}%</span>
              </div>
              <Slider
                value={inputVolume}
                onValueChange={setInputVolume}
                max={100}
                step={1}
                className="w-full"
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Output</h3>
            <div className="p-4 bg-secondary/30 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Speaker className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">Output Volume</span>
                </div>
                <span className="text-xs text-muted-foreground">{outputVolume[0]}%</span>
              </div>
              <Slider
                value={outputVolume}
                onValueChange={setOutputVolume}
                max={100}
                step={1}
                className="w-full"
              />
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Processing</h3>
            <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
              <div>
                <p className="text-sm">Noise Suppression</p>
                <p className="text-xs text-muted-foreground">Remove background noise</p>
              </div>
              <Switch checked={noiseSuppression} onCheckedChange={setNoiseSuppression} />
            </div>
            <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
              <div>
                <p className="text-sm">Echo Cancellation</p>
                <p className="text-xs text-muted-foreground">Prevent echo in calls</p>
              </div>
              <Switch checked={echoCancellation} onCheckedChange={setEchoCancellation} />
            </div>
            <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
              <div>
                <p className="text-sm">Auto Gain Control</p>
                <p className="text-xs text-muted-foreground">Automatically adjust mic volume</p>
              </div>
              <Switch checked={autoGainControl} onCheckedChange={setAutoGainControl} />
            </div>
          </div>

          <button className="w-full py-3 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors text-sm font-medium">
            Test Microphone
          </button>
        </div>
      )}

      {/* Language Sub-Panel */}
      {view === "language" && (
        <div className="space-y-4 animate-fade-in">
          <p className="text-sm text-muted-foreground">Select your preferred language</p>
          <div className="space-y-2">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => setSelectedLang(lang.code)}
                className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${
                  selectedLang === lang.code
                    ? "bg-primary/15 border border-primary/40"
                    : "bg-secondary/30 border border-transparent hover:bg-secondary/50"
                }`}
              >
                <span className="text-xl">{lang.flag}</span>
                <span className={`text-sm flex-1 text-left ${selectedLang === lang.code ? "font-medium text-primary" : ""}`}>
                  {lang.label}
                </span>
                {selectedLang === lang.code && (
                  <Check className="w-4 h-4 text-primary" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
