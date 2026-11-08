import { useEffect, useId, useState, type FormEvent } from "react";
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

const PASSWORD_MIN = 8;

type Field = "current" | "next" | "repeat";

interface ChangePasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ChangePasswordDialog = ({ open, onOpenChange }: ChangePasswordDialogProps) => {
  const { t } = usePreferences();
  const { changePassword } = useAuth();
  const formId = useId();
  const [values, setValues] = useState<Record<Field, string>>({ current: "", next: "", repeat: "" });
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState<TranslationKey | null>(null);

  // Start from a clean form every time the dialog opens.
  useEffect(() => {
    if (!open) return;
    setValues({ current: "", next: "", repeat: "" });
    setSubmitted(false);
    setBusy(false);
    setFailure(null);
  }, [open]);

  const errors: Partial<Record<Field, TranslationKey>> = {};
  if (!values.current) errors.current = "auth.errorPasswordRequired";
  if (values.next.length < PASSWORD_MIN) errors.next = "auth.errorPassword";
  if (values.repeat !== values.next) errors.repeat = "password.errorMatch";

  const field = (name: Field, label: TranslationKey, autoComplete: string) => {
    const error = submitted ? errors[name] : undefined;
    const id = `${formId}-${name}`;
    return (
      <div className="space-y-2">
        <Label htmlFor={id}>{t(label)}</Label>
        <Input
          id={id}
          type="password"
          value={values[name]}
          onChange={(event) => setValues((previous) => ({ ...previous, [name]: event.target.value }))}
          autoComplete={autoComplete}
          dir="ltr"
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
        />
        {error && (
          <p id={`${id}-error`} className="text-xs text-destructive">
            {t(error)}
          </p>
        )}
      </div>
    );
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (busy) return;
    setSubmitted(true);
    setFailure(null);
    const firstInvalid = (["current", "next", "repeat"] as Field[]).find((name) => errors[name]);
    if (firstInvalid) {
      document.getElementById(`${formId}-${firstInvalid}`)?.focus();
      return;
    }
    setBusy(true);
    try {
      await changePassword(values.current, values.next);
      onOpenChange(false);
      toast.success(t("password.saved"));
    } catch (error) {
      setFailure(errorMessageKey(error));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("settings.changePassword")}</DialogTitle>
          <DialogDescription>{t("password.description")}</DialogDescription>
        </DialogHeader>

        <form id={formId} onSubmit={(event) => void handleSubmit(event)} noValidate className="space-y-4">
          {field("current", "password.current", "current-password")}
          {field("next", "password.new", "new-password")}
          {field("repeat", "password.confirm", "new-password")}
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
