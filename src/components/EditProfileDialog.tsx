import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { Camera } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import defaultAvatar from "@/assets/user-avatar.webp";
import { usePreferences } from "@/context/PreferencesContext";
import { useProfile, type Profile } from "@/context/ProfileContext";
import { logActivity } from "@/hooks/use-activity-log";
import { errorMessageKey } from "@/lib/backend/messages";
import { errorCode } from "@/lib/backend/types";
import { resizeImageToDataUrl } from "@/lib/image";
import type { TranslationKey } from "@/i18n/en";

const USERNAME_PATTERN = /^[a-zA-Z0-9._]{3,20}$/;
// Same rule as the server (pocketbase/pb_migrations).
const PHONE_PATTERN = /^[0-9+() -]+$/;

type Field = "displayName" | "username" | "phone";

const emptyProfile: Profile = { displayName: "", username: "", bio: "", email: "", phone: "", avatar: null };

interface EditProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const EditProfileDialog = ({ open, onOpenChange }: EditProfileDialogProps) => {
  const { t } = usePreferences();
  const { profile, updateProfile } = useProfile();
  const formId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [draft, setDraft] = useState<Profile>(profile ?? emptyProfile);
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState<TranslationKey | null>(null);
  const [usernameTaken, setUsernameTaken] = useState(false);

  // Each time the dialog opens, start from what is saved.
  useEffect(() => {
    if (open) {
      setDraft(profile ?? emptyProfile);
      setSubmitted(false);
      setBusy(false);
      setFailure(null);
      setUsernameTaken(false);
    }
    // Only when opening: re-syncing on every profile change would wipe what's being typed.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Signing out with the dialog open closes it.
  useEffect(() => {
    if (open && !profile) onOpenChange(false);
  }, [open, profile, onOpenChange]);

  const set = <K extends keyof Profile>(key: K, value: Profile[K]) => setDraft((previous) => ({ ...previous, [key]: value }));

  const username = draft.username.trim();
  const phone = draft.phone.trim();
  const errors: Partial<Record<Field, TranslationKey>> = {};
  if (!draft.displayName.trim()) errors.displayName = "profile.errorName";
  if (username && !USERNAME_PATTERN.test(username)) errors.username = "profile.errorUsername";
  else if (usernameTaken) errors.username = "error.usernameTaken";
  if (phone && !PHONE_PATTERN.test(phone)) errors.phone = "profile.errorPhone";

  const fieldProps = (field: Field) => {
    const error = submitted ? errors[field] : undefined;
    return {
      id: `${formId}-${field}`,
      "aria-invalid": Boolean(error),
      "aria-describedby": error ? `${formId}-${field}-error` : undefined,
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

  const handlePhoto = async (file: File | undefined) => {
    if (!file) return;
    try {
      set("avatar", await resizeImageToDataUrl(file));
    } catch {
      toast.error(t("profile.errorPhoto"));
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (busy) return;
    setSubmitted(true);
    setFailure(null);
    const firstInvalid = (["displayName", "username", "phone"] as Field[]).find((field) => errors[field]);
    if (firstInvalid) {
      document.getElementById(`${formId}-${firstInvalid}`)?.focus();
      return;
    }
    setBusy(true);
    try {
      await updateProfile({
        displayName: draft.displayName.trim(),
        username,
        bio: draft.bio.trim(),
        phone,
        avatar: draft.avatar,
      });
      logActivity({ type: "profile" });
      onOpenChange(false);
      toast.success(t("profile.saved"));
    } catch (error) {
      if (errorCode(error) === "username_taken") {
        setUsernameTaken(true);
        document.getElementById(`${formId}-username`)?.focus();
      } else {
        setFailure(errorMessageKey(error));
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("profile.title")}</DialogTitle>
          <DialogDescription>{t("profile.description")}</DialogDescription>
        </DialogHeader>

        <form id={formId} onSubmit={(event) => void handleSubmit(event)} noValidate className="space-y-4">
          <div className="flex items-center gap-4">
            <img
              src={draft.avatar ?? defaultAvatar}
              alt={t("profile.photo")}
              className="h-16 w-16 shrink-0 rounded-full object-cover ring-2 ring-primary/40"
            />
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="secondary" size="sm" onClick={() => fileInputRef.current?.click()}>
                <Camera />
                {t("profile.changePhoto")}
              </Button>
              {draft.avatar && (
                <Button type="button" variant="ghost" size="sm" onClick={() => set("avatar", null)}>
                  {t("profile.removePhoto")}
                </Button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="sr-only"
                tabIndex={-1}
                aria-hidden="true"
                onChange={(event) => {
                  void handlePhoto(event.target.files?.[0]);
                  event.target.value = "";
                }}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor={`${formId}-displayName`}>{t("profile.displayName")}</Label>
            <Input
              {...fieldProps("displayName")}
              value={draft.displayName}
              onChange={(event) => set("displayName", event.target.value)}
              maxLength={40}
              autoComplete="name"
            />
            {fieldError("displayName")}
          </div>

          <div className="space-y-2">
            <Label htmlFor={`${formId}-username`}>
              {t("profile.username")} <span className="text-xs font-normal text-muted-foreground">({t("common.optional")})</span>
            </Label>
            <Input
              {...fieldProps("username")}
              value={draft.username}
              onChange={(event) => {
                set("username", event.target.value);
                setUsernameTaken(false);
              }}
              maxLength={20}
              autoComplete="username"
              dir="ltr"
            />
            {fieldError("username")}
          </div>

          <div className="space-y-2">
            <Label htmlFor={`${formId}-bio`}>{t("profile.bio")}</Label>
            <Textarea
              id={`${formId}-bio`}
              value={draft.bio}
              onChange={(event) => set("bio", event.target.value)}
              placeholder={t("profile.bioPlaceholder")}
              maxLength={160}
              rows={2}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor={`${formId}-email`}>{t("profile.email")}</Label>
              <Input
                id={`${formId}-email`}
                type="email"
                value={draft.email}
                readOnly
                aria-describedby={`${formId}-email-note`}
                dir="ltr"
                className="text-muted-foreground"
              />
              <p id={`${formId}-email-note`} className="text-xs text-muted-foreground">
                {t("profile.emailNote")}
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor={`${formId}-phone`}>
                {t("profile.phone")} <span className="text-xs font-normal text-muted-foreground">({t("common.optional")})</span>
              </Label>
              <Input
                {...fieldProps("phone")}
                type="tel"
                value={draft.phone}
                onChange={(event) => set("phone", event.target.value)}
                maxLength={20}
                autoComplete="tel"
                dir="ltr"
              />
              {fieldError("phone")}
            </div>
          </div>

          {failure && (
            <p role="alert" className="rounded-lg bg-destructive/10 p-3 text-xs text-destructive">
              {t(failure)}
            </p>
          )}
        </form>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            {t("common.cancel")}
          </Button>
          <Button type="submit" form={formId} disabled={busy} aria-busy={busy}>
            {t(busy ? "common.saving" : "common.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
