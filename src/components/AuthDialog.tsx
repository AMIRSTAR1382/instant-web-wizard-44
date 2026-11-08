import { Fragment, useEffect, useId, useState, type FormEvent, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { usePreferences } from "@/context/PreferencesContext";
import { errorMessageKey } from "@/lib/backend/messages";
import type { TranslationKey } from "@/i18n/en";

export type AuthMode = "signIn" | "signUp" | "reset";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_MIN = 8;

type Field = "displayName" | "email" | "password";

const titles: Record<AuthMode, TranslationKey> = {
  signIn: "auth.signInTitle",
  signUp: "auth.signUpTitle",
  reset: "auth.resetTitle",
};
const descriptions: Record<AuthMode, TranslationKey> = {
  signIn: "auth.signInDesc",
  signUp: "auth.signUpDesc",
  reset: "auth.resetDesc",
};
const submitLabels: Record<AuthMode, { idle: TranslationKey; busy: TranslationKey }> = {
  signIn: { idle: "auth.signIn", busy: "auth.signingIn" },
  signUp: { idle: "auth.signUp", busy: "auth.creating" },
  reset: { idle: "auth.sendLink", busy: "auth.sending" },
};

/** Fills "{terms}"-style slots in a translated sentence with links. */
function withLinks(template: string, links: Record<string, ReactNode>) {
  return template.split(/\{(\w+)\}/).map((part, index) => (
    <Fragment key={index}>{index % 2 === 1 ? (links[part] ?? part) : part}</Fragment>
  ));
}

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialMode?: AuthMode;
  /** Why the visitor is asked to sign in, e.g. "Sign in to join Gaming Zone." */
  reason?: string;
  /** Runs once the visitor has signed in or created an account. */
  onSignedIn?: () => void;
}

export const AuthDialog = ({ open, onOpenChange, initialMode = "signIn", reason, onSignedIn }: AuthDialogProps) => {
  const { t } = usePreferences();
  const { signIn, signUp, requestPasswordReset } = useAuth();
  const formId = useId();

  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState<TranslationKey | null>(null);

  // Start from a clean form every time the dialog opens.
  useEffect(() => {
    if (!open) return;
    setMode(initialMode);
    setDisplayName("");
    setEmail("");
    setPassword("");
    setShowPassword(false);
    setSubmitted(false);
    setBusy(false);
    setFailure(null);
  }, [open, initialMode]);

  const switchMode = (next: AuthMode) => {
    setMode(next);
    setSubmitted(false);
    setFailure(null);
  };

  const fields: Field[] =
    mode === "signUp" ? ["displayName", "email", "password"] : mode === "signIn" ? ["email", "password"] : ["email"];

  const errors: Partial<Record<Field, TranslationKey>> = {};
  if (mode === "signUp" && !displayName.trim()) errors.displayName = "profile.errorName";
  if (!EMAIL_PATTERN.test(email.trim())) errors.email = "profile.errorEmail";
  if (mode === "signIn" && !password) errors.password = "auth.errorPasswordRequired";
  if (mode === "signUp" && password.length < PASSWORD_MIN) errors.password = "auth.errorPassword";

  const fieldProps = (field: Field) => {
    const error = submitted ? errors[field] : undefined;
    const describedBy = [
      error && `${formId}-${field}-error`,
      field === "password" && mode === "signUp" && `${formId}-password-hint`,
    ]
      .filter(Boolean)
      .join(" ");
    return {
      id: `${formId}-${field}`,
      "aria-invalid": Boolean(error),
      "aria-describedby": describedBy || undefined,
    };
  };

  const fieldError = (field: Field) => {
    const error = submitted ? errors[field] : undefined;
    return error ? (
      <p id={`${formId}-${field}-error`} className="text-xs text-destructive">
        {t(error)}
      </p>
    ) : null;
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (busy) return;
    setSubmitted(true);
    setFailure(null);
    const firstInvalid = fields.find((field) => errors[field]);
    if (firstInvalid) {
      document.getElementById(`${formId}-${firstInvalid}`)?.focus();
      return;
    }
    setBusy(true);
    try {
      if (mode === "reset") {
        await requestPasswordReset(email.trim());
        toast.success(t("auth.resetSent", { email: email.trim() }));
        switchMode("signIn");
        return;
      }
      const account =
        mode === "signUp"
          ? await signUp({ displayName: displayName.trim(), email: email.trim(), password })
          : await signIn(email.trim(), password);
      onOpenChange(false);
      toast.success(t(mode === "signUp" ? "auth.welcome" : "auth.welcomeBack", { name: account.displayName }));
      onSignedIn?.();
    } catch (error) {
      setFailure(errorMessageKey(error));
    } finally {
      setBusy(false);
    }
  };

  const closeOnNavigate = () => onOpenChange(false);
  const linkClass = "font-medium text-primary underline-offset-4 hover:underline";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t(titles[mode])}</DialogTitle>
          <DialogDescription>{reason && mode !== "reset" ? reason : t(descriptions[mode])}</DialogDescription>
        </DialogHeader>

        <form id={formId} onSubmit={(event) => void handleSubmit(event)} noValidate className="space-y-4">
          {mode === "signUp" && (
            <div className="space-y-2">
              <Label htmlFor={`${formId}-displayName`}>{t("profile.displayName")}</Label>
              <Input
                {...fieldProps("displayName")}
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                maxLength={40}
                autoComplete="name"
              />
              {fieldError("displayName")}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor={`${formId}-email`}>{t("profile.email")}</Label>
            <Input
              {...fieldProps("email")}
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              dir="ltr"
            />
            {fieldError("email")}
          </div>

          {mode !== "reset" && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor={`${formId}-password`}>{t("auth.password")}</Label>
                {mode === "signIn" && (
                  <button type="button" onClick={() => switchMode("reset")} className={`text-xs ${linkClass}`}>
                    {t("auth.forgot")}
                  </button>
                )}
              </div>
              <div className="relative">
                <Input
                  {...fieldProps("password")}
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete={mode === "signUp" ? "new-password" : "current-password"}
                  dir="ltr"
                  className="pe-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? t("auth.hidePassword") : t("auth.showPassword")}
                  aria-pressed={showPassword}
                  className="absolute inset-y-0 end-0 flex w-10 items-center justify-center rounded-e-md text-muted-foreground transition-colors hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {mode === "signUp" && (
                <p id={`${formId}-password-hint`} className="text-xs text-muted-foreground">
                  {t("auth.passwordHint")}
                </p>
              )}
              {fieldError("password")}
            </div>
          )}

          {failure && (
            <p role="alert" className="rounded-lg bg-destructive/10 p-3 text-xs text-destructive">
              {t(failure)}
            </p>
          )}

          {mode === "signUp" && (
            <p className="text-xs text-muted-foreground">
              {withLinks(t("auth.agree"), {
                terms: (
                  <Link to="/terms" onClick={closeOnNavigate} className={linkClass}>
                    {t("footer.terms")}
                  </Link>
                ),
                privacy: (
                  <Link to="/privacy" onClick={closeOnNavigate} className={linkClass}>
                    {t("footer.privacy")}
                  </Link>
                ),
              })}
            </p>
          )}

          <p className="text-sm text-muted-foreground">
            {mode === "signIn" ? (
              <>
                {t("auth.noAccount")}{" "}
                <button type="button" onClick={() => switchMode("signUp")} className={linkClass}>
                  {t("auth.signUp")}
                </button>
              </>
            ) : mode === "signUp" ? (
              <>
                {t("auth.haveAccount")}{" "}
                <button type="button" onClick={() => switchMode("signIn")} className={linkClass}>
                  {t("auth.signIn")}
                </button>
              </>
            ) : (
              <button type="button" onClick={() => switchMode("signIn")} className={linkClass}>
                {t("auth.backToSignIn")}
              </button>
            )}
          </p>
        </form>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            {t("common.cancel")}
          </Button>
          <Button type="submit" form={formId} disabled={busy} aria-busy={busy}>
            {t(busy ? submitLabels[mode].busy : submitLabels[mode].idle)}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
