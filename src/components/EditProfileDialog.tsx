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
import { resizeImageToDataUrl } from "@/lib/image";
import type { TranslationKey } from "@/i18n/en";

const USERNAME_PATTERN = /^[a-zA-Z0-9._]{3,20}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Field = "displayName" | "username" | "email";

interface EditProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const EditProfileDialog = ({ open, onOpenChange }: EditProfileDialogProps) => {
  const { t } = usePreferences();
  const { profile, updateProfile } = useProfile();
  const formId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [draft, setDraft] = useState<Profile>(profile);
  const [submitted, setSubmitted] = useState(false);

  // Each time the dialog opens, start from what is saved.
  useEffect(() => {
    if (open) {
      setDraft(profile);
      setSubmitted(false);
    }
    // Only when opening: re-syncing on every profile change would wipe what's being typed.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const set = <K extends keyof Profile>(key: K, value: Profile[K]) => setDraft((previous) => ({ ...previous, [key]: value }));

  const errors: Partial<Record<Field, TranslationKey>> = {};
  if (!draft.displayName.trim()) errors.displayName = "profile.errorName";
  if (!USERNAME_PATTERN.test(draft.username.trim())) errors.username = "profile.errorUsername";
  if (draft.email.trim() && !EMAIL_PATTERN.test(draft.email.trim())) errors.email = "profile.errorEmail";

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

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    setSubmitted(true);
    const firstInvalid = (["displayName", "username", "email"] as Field[]).find((field) => errors[field]);
    if (firstInvalid) {
      document.getElementById(`${formId}-${firstInvalid}`)?.focus();
      return;
    }
    updateProfile({
      displayName: draft.displayName.trim(),
      username: draft.username.trim(),
      bio: draft.bio.trim(),
      email: draft.email.trim(),
      phone: draft.phone.trim(),
      avatar: draft.avatar,
    });
    logActivity({ type: "profile" });
    onOpenChange(false);
    toast.success(t("profile.saved"));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("profile.title")}</DialogTitle>
          <DialogDescription>{t("profile.description")}</DialogDescription>
        </DialogHeader>

        <form id={formId} onSubmit={handleSubmit} noValidate className="space-y-4">
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
            <Label htmlFor={`${formId}-username`}>{t("profile.username")}</Label>
            <Input
              {...fieldProps("username")}
              value={draft.username}
              onChange={(event) => set("username", event.target.value)}
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
              <Label htmlFor={`${formId}-email`}>
                {t("profile.email")} <span className="text-xs font-normal text-muted-foreground">({t("common.optional")})</span>
              </Label>
              <Input
                {...fieldProps("email")}
                type="email"
                value={draft.email}
                onChange={(event) => set("email", event.target.value)}
                autoComplete="email"
                dir="ltr"
              />
              {fieldError("email")}
            </div>
            <div className="space-y-2">
              <Label htmlFor={`${formId}-phone`}>
                {t("profile.phone")} <span className="text-xs font-normal text-muted-foreground">({t("common.optional")})</span>
              </Label>
              <Input
                id={`${formId}-phone`}
                type="tel"
                value={draft.phone}
                onChange={(event) => set("phone", event.target.value)}
                autoComplete="tel"
                dir="ltr"
              />
            </div>
          </div>
        </form>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            {t("common.cancel")}
          </Button>
          <Button type="submit" form={formId}>
            {t("common.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
