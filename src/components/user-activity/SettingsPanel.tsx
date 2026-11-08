import { useState, type ReactNode } from "react";
import {
  ArrowLeft, Bell, Check, ChevronRight, Eye, EyeOff, Globe, Lock, Mic, Monitor, Moon, Palette,
  Shield, Speaker, Sun, User, Volume2, type LucideIcon,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { MicTest } from "@/components/MicTest";
import { usePreferences, type ThemePreference } from "@/context/PreferencesContext";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { useProfile } from "@/context/ProfileContext";
import { useDialogs } from "@/context/DialogsContext";
import { usePersistentState } from "@/hooks/use-persistent-state";
import { locales } from "@/lib/i18n";
import type { TranslationKey } from "@/i18n/en";
import { cn } from "@/lib/utils";

type SettingsView = "main" | "account" | "privacy" | "appearance" | "voice" | "language";

const themes: { id: ThemePreference; label: TranslationKey; icon: LucideIcon }[] = [
  { id: "dark", label: "settings.theme.dark", icon: Moon },
  { id: "light", label: "settings.theme.light", icon: Sun },
  { id: "system", label: "settings.theme.system", icon: Monitor },
];

const settingsOptions: { icon: LucideIcon; label: TranslationKey; description: TranslationKey; view: SettingsView }[] = [
  { icon: User, label: "settings.account", description: "settings.accountDesc", view: "account" },
  { icon: Shield, label: "settings.privacy", description: "settings.privacyDesc", view: "privacy" },
  { icon: Palette, label: "settings.appearance", description: "settings.appearanceDesc", view: "appearance" },
  { icon: Volume2, label: "settings.voice", description: "settings.voiceDesc", view: "voice" },
  { icon: Globe, label: "settings.language", description: "settings.languageDesc", view: "language" },
];

const maskEmail = (email: string) => {
  const [user, domain] = email.split("@");
  return domain ? `${user.slice(0, 1)}***@${domain}` : "***";
};
const maskPhone = (phone: string) => `***${phone.replace(/\s/g, "").slice(-4)}`;

const SectionTitle = ({ children }: { children: ReactNode }) => (
  <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">{children}</h3>
);

const ToggleRow = ({
  label,
  description,
  icon: Icon,
  checked,
  onCheckedChange,
}: {
  label: string;
  description?: string;
  icon?: LucideIcon;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) => (
  <label className="flex cursor-pointer items-center justify-between gap-3 rounded-lg bg-secondary/30 p-3">
    <span className="flex items-center gap-3">
      {Icon && <Icon className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />}
      <span>
        <span className="block text-sm">{label}</span>
        {description && <span className="block text-xs text-muted-foreground">{description}</span>}
      </span>
    </span>
    <Switch checked={checked} onCheckedChange={onCheckedChange} />
  </label>
);

const PrivateValue = ({ label, value, mask }: { label: string; value: string; mask: (value: string) => string }) => {
  const { t } = usePreferences();
  const [revealed, setRevealed] = useState(false);
  return (
    <div className="rounded-lg bg-secondary/30 p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <div className="flex items-center justify-between gap-2">
        <p className="truncate text-sm font-medium" dir="ltr">
          {value ? (revealed ? value : mask(value)) : <span className="text-muted-foreground">{t("common.notSet")}</span>}
        </p>
        {value && (
          <button
            onClick={() => setRevealed(!revealed)}
            aria-label={`${revealed ? t("common.hide") : t("common.show")}: ${label}`}
            aria-pressed={revealed}
            className="rounded p-1 text-muted-foreground transition-colors hover:text-foreground"
          >
            {revealed ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )}
      </div>
    </div>
  );
};

interface SettingsPanelProps {
  onBack: () => void;
}

export const SettingsPanel = ({ onBack }: SettingsPanelProps) => {
  const {
    t, locale, setLocale, dir, theme, setTheme, compactMode, setCompactMode, animations, setAnimations, formatNumber,
  } = usePreferences();
  const { signOut } = useAuth();
  const { profile, avatarUrl } = useProfile();
  const { openEditProfile, openSignIn, openChangePassword } = useDialogs();
  const [view, setView] = useState<SettingsView>("main");

  // Every preference below is saved in localStorage, so it survives a page reload.
  const [showOnlineStatus, setShowOnlineStatus] = usePersistentState("settings.showOnlineStatus", true);
  const [showActivity, setShowActivity] = usePersistentState("settings.showActivity", true);
  const [allowDMs, setAllowDMs] = usePersistentState("settings.allowDMs", true);
  const [readReceipts, setReadReceipts] = usePersistentState("settings.readReceipts", false);
  const [inputVolume, setInputVolume] = usePersistentState("settings.inputVolume", [75]);
  const [outputVolume, setOutputVolume] = usePersistentState("settings.outputVolume", [80]);
  const [noiseSuppression, setNoiseSuppression] = usePersistentState("settings.noiseSuppression", true);
  const [echoCancellation, setEchoCancellation] = usePersistentState("settings.echoCancellation", true);
  const [autoGainControl, setAutoGainControl] = usePersistentState("settings.autoGainControl", true);
  const [emailNotifs, setEmailNotifs] = usePersistentState("settings.emailNotifications", true);
  const [pushNotifs, setPushNotifs] = usePersistentState("settings.pushNotifications", true);

  const handleBack = () => (view === "main" ? onBack() : setView("main"));

  const title = view === "main" ? t("settings.title") : t(settingsOptions.find((o) => o.view === view)!.label);

  // Preferences on this device stay; the account's data stays on the server.
  const handleSignOut = () => {
    signOut();
    setView("main");
    toast(t("auth.signedOut"));
  };

  const signInButton = (
    <button
      onClick={() => openSignIn()}
      className="w-full rounded-lg bg-primary/20 py-3 text-sm font-medium text-primary transition-colors hover:bg-primary/30"
    >
      {t("auth.signInOrUp")}
    </button>
  );

  return (
    <div className="absolute inset-0 overflow-y-auto p-6">
      <div className="mb-8 flex items-center gap-3">
        <button
          onClick={handleBack}
          aria-label={t("common.back")}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary transition-all duration-200 hover:-translate-x-1 hover:bg-primary/20 rtl:hover:translate-x-1"
        >
          <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
        </button>
        <h2 className="text-lg font-bold">{title}</h2>
      </div>

      {view === "main" && (
        <>
          <div className="space-y-2">
            {settingsOptions.map((option, index) => (
              <button
                key={option.view}
                onClick={() => setView(option.view)}
                className="group flex w-full animate-fade-in items-center gap-4 rounded-lg p-3 transition-all hover:bg-secondary/80"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary/30 to-accent/30 transition-transform group-hover:scale-110">
                  <option.icon className="h-5 w-5" />
                </div>
                <div className="flex-1 text-start">
                  <p className="text-sm font-medium">{t(option.label)}</p>
                  <p className="text-xs text-muted-foreground">{t(option.description)}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-foreground rtl:rotate-180" />
              </button>
            ))}
          </div>

          <div className="mt-8 border-t border-border pt-6">
            {profile ? (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button className="w-full rounded-lg bg-destructive/10 py-3 text-sm font-medium text-destructive transition-colors hover:bg-destructive/20">
                  {t("settings.logout")}
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t("settings.logoutTitle")}</AlertDialogTitle>
                  <AlertDialogDescription>{t("settings.logoutText")}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
                  <AlertDialogAction onClick={handleSignOut} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    {t("settings.logout")}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            ) : (
              signInButton
            )}
          </div>
        </>
      )}

      {view === "account" && !profile && (
        <div className="animate-fade-in rounded-xl bg-secondary/50 p-4">
          <p className="mb-4 text-sm text-muted-foreground">{t("settings.signInPrompt")}</p>
          {signInButton}
        </div>
      )}

      {view === "account" && profile && (
        <div className="animate-fade-in space-y-6">
          <div className="rounded-xl bg-secondary/50 p-4">
            <div className="mb-4 flex items-center gap-4">
              <img src={avatarUrl} alt="" className="h-16 w-16 rounded-full object-cover" />
              <div className="min-w-0">
                <p className="truncate font-semibold">{profile.displayName}</p>
                {profile.username && (
                  <p className="truncate text-sm text-muted-foreground" dir="ltr">
                    @{profile.username}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={openEditProfile}
              className="w-full rounded-lg bg-primary/20 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/30"
            >
              {t("panel.editProfile")}
            </button>
          </div>

          <div className="space-y-3">
            <SectionTitle>{t("settings.accountInfo")}</SectionTitle>
            <div className="rounded-lg bg-secondary/30 p-3">
              <p className="text-xs text-muted-foreground">{t("settings.username")}</p>
              <p className="text-sm font-medium" dir="ltr">
                {profile.username || <span className="text-muted-foreground">{t("common.notSet")}</span>}
              </p>
            </div>
            <PrivateValue label={t("settings.email")} value={profile.email} mask={maskEmail} />
            <PrivateValue label={t("settings.phone")} value={profile.phone} mask={maskPhone} />
          </div>

          <div className="space-y-3">
            <SectionTitle>{t("settings.notifications")}</SectionTitle>
            <ToggleRow icon={Bell} label={t("settings.emailNotifications")} checked={emailNotifs} onCheckedChange={setEmailNotifs} />
            <ToggleRow icon={Bell} label={t("settings.pushNotifications")} checked={pushNotifs} onCheckedChange={setPushNotifs} />
          </div>

          <div className="space-y-3">
            <SectionTitle>{t("settings.security")}</SectionTitle>
            <button
              onClick={openChangePassword}
              className="group flex w-full items-center gap-3 rounded-lg bg-secondary/30 p-3 transition-colors hover:bg-secondary/80"
            >
              <Lock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{t("settings.changePassword")}</span>
              <ChevronRight className="ms-auto h-4 w-4 text-muted-foreground transition-colors group-hover:text-foreground rtl:rotate-180" />
            </button>
          </div>
        </div>
      )}

      {view === "privacy" && (
        <div className="animate-fade-in space-y-6">
          <div className="space-y-3">
            <SectionTitle>{t("settings.activityStatus")}</SectionTitle>
            <ToggleRow
              icon={Eye}
              label={t("settings.showOnline")}
              description={t("settings.showOnlineDesc")}
              checked={showOnlineStatus}
              onCheckedChange={setShowOnlineStatus}
            />
            <ToggleRow
              icon={Eye}
              label={t("settings.showActivity")}
              description={t("settings.showActivityDesc")}
              checked={showActivity}
              onCheckedChange={setShowActivity}
            />
          </div>

          <div className="space-y-3">
            <SectionTitle>{t("settings.directMessages")}</SectionTitle>
            <ToggleRow
              icon={Lock}
              label={t("settings.allowDMs")}
              description={t("settings.allowDMsDesc")}
              checked={allowDMs}
              onCheckedChange={setAllowDMs}
            />
            <ToggleRow
              icon={EyeOff}
              label={t("settings.readReceipts")}
              description={t("settings.readReceiptsDesc")}
              checked={readReceipts}
              onCheckedChange={setReadReceipts}
            />
          </div>

          <div className="space-y-3">
            <SectionTitle>{t("settings.blockedUsers")}</SectionTitle>
            <div className="rounded-lg bg-secondary/30 p-4 text-center">
              <Shield className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">{t("settings.noBlocked")}</p>
              <p className="mt-1 text-xs text-muted-foreground/60">{t("settings.noBlockedDesc")}</p>
            </div>
          </div>
        </div>
      )}

      {view === "appearance" && (
        <div className="animate-fade-in space-y-6">
          <div className="space-y-3">
            <SectionTitle>{t("settings.theme")}</SectionTitle>
            <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label={t("settings.theme")}>
              {themes.map((option) => {
                const selected = theme === option.id;
                return (
                  <button
                    key={option.id}
                    role="radio"
                    aria-checked={selected}
                    onClick={() => setTheme(option.id)}
                    className={cn(
                      "flex flex-col items-center gap-2 rounded-lg border p-3 transition-all",
                      selected ? "border-primary bg-primary/10" : "border-border bg-secondary/30 hover:border-primary/50",
                    )}
                  >
                    <option.icon className={cn("h-5 w-5", selected ? "text-primary" : "text-muted-foreground")} />
                    <span className={cn("text-xs", selected ? "font-medium text-primary" : "text-muted-foreground")}>
                      {t(option.label)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-3">
            <SectionTitle>{t("settings.display")}</SectionTitle>
            <ToggleRow label={t("settings.compact")} description={t("settings.compactDesc")} checked={compactMode} onCheckedChange={setCompactMode} />
            <ToggleRow label={t("settings.animations")} description={t("settings.animationsDesc")} checked={animations} onCheckedChange={setAnimations} />
          </div>

          <div className="space-y-3">
            <SectionTitle>{t("settings.preview")}</SectionTitle>
            <div className="rounded-lg border border-border bg-background p-4 text-foreground">
              <div className="mb-3 flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-accent" />
                <div>
                  <p className="text-sm font-medium">{t("settings.previewUser")}</p>
                  <p className="text-xs text-muted-foreground">{t("settings.previewTime")}</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{t("settings.previewText")}</p>
            </div>
          </div>
        </div>
      )}

      {view === "voice" && (
        <div className="animate-fade-in space-y-6">
          <div className="space-y-4">
            <SectionTitle>{t("settings.input")}</SectionTitle>
            <div className="space-y-3 rounded-lg bg-secondary/30 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Mic className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{t("settings.inputVolume")}</span>
                </div>
                <span className="text-xs text-muted-foreground">{formatNumber(inputVolume[0])}{locale === "fa" ? "٪" : "%"}</span>
              </div>
              <Slider value={inputVolume} onValueChange={setInputVolume} max={100} step={1} dir={dir} aria-label={t("settings.inputVolume")} />
            </div>
          </div>

          <div className="space-y-4">
            <SectionTitle>{t("settings.output")}</SectionTitle>
            <div className="space-y-3 rounded-lg bg-secondary/30 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Speaker className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{t("settings.outputVolume")}</span>
                </div>
                <span className="text-xs text-muted-foreground">{formatNumber(outputVolume[0])}{locale === "fa" ? "٪" : "%"}</span>
              </div>
              <Slider value={outputVolume} onValueChange={setOutputVolume} max={100} step={1} dir={dir} aria-label={t("settings.outputVolume")} />
            </div>
          </div>

          <div className="space-y-3">
            <SectionTitle>{t("settings.processing")}</SectionTitle>
            <ToggleRow label={t("settings.noise")} description={t("settings.noiseDesc")} checked={noiseSuppression} onCheckedChange={setNoiseSuppression} />
            <ToggleRow label={t("settings.echo")} description={t("settings.echoDesc")} checked={echoCancellation} onCheckedChange={setEchoCancellation} />
            <ToggleRow label={t("settings.gain")} description={t("settings.gainDesc")} checked={autoGainControl} onCheckedChange={setAutoGainControl} />
          </div>

          <MicTest
            inputVolume={inputVolume[0]}
            noiseSuppression={noiseSuppression}
            echoCancellation={echoCancellation}
            autoGainControl={autoGainControl}
          />
        </div>
      )}

      {view === "language" && (
        <div className="animate-fade-in space-y-4">
          <p className="text-sm text-muted-foreground">{t("settings.selectLanguage")}</p>
          <div className="space-y-2" role="radiogroup" aria-label={t("settings.language")}>
            {locales.map((option) => {
              const selected = locale === option.code;
              return (
                <button
                  key={option.code}
                  role="radio"
                  aria-checked={selected}
                  lang={option.code}
                  onClick={() => setLocale(option.code)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg border p-3 transition-all",
                    selected ? "border-primary/40 bg-primary/15" : "border-transparent bg-secondary/30 hover:bg-secondary/50",
                  )}
                >
                  <span className="text-xl" aria-hidden="true">
                    {option.flag}
                  </span>
                  <span className={cn("flex-1 text-start text-sm", selected && "font-medium text-primary")}>{option.label}</span>
                  {selected && <Check className="h-4 w-4 text-primary" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
