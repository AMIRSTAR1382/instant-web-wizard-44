import { useId, useState, type FormEvent } from "react";
import { Copy, Github, Instagram, Mail, Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { usePreferences } from "@/context/PreferencesContext";
import { siteConfig } from "@/config/site";
import { useDocumentTitle } from "@/hooks/use-document-title";
import type { TranslationKey } from "@/i18n/en";
import { copyText } from "@/lib/utils";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
type Field = "name" | "email" | "message";

/**
 * Contact page. There is no server to send mail from yet, so the form opens the visitor's
 * own email app with the message filled in (a mailto: link to siteConfig.contactEmail).
 */
const Contact = () => {
  const { t } = usePreferences();
  useDocumentTitle(t("contact.title"), { description: t("contact.subtitle") });
  const formId = useId();
  const [values, setValues] = useState<Record<Field, string>>({ name: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const errors: Partial<Record<Field, TranslationKey>> = {};
  if (!values.name.trim()) errors.name = "contact.errorName";
  if (!EMAIL_PATTERN.test(values.email.trim())) errors.email = "contact.errorEmail";
  if (values.message.trim().length < 10) errors.message = "contact.errorMessage";

  const fieldProps = (field: Field) => {
    const error = submitted ? errors[field] : undefined;
    return {
      id: `${formId}-${field}`,
      value: values[field],
      onChange: (event: { target: { value: string } }) => setValues((previous) => ({ ...previous, [field]: event.target.value })),
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

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    setSubmitted(true);
    const firstInvalid = (["name", "email", "message"] as Field[]).find((field) => errors[field]);
    if (firstInvalid) {
      document.getElementById(`${formId}-${firstInvalid}`)?.focus();
      return;
    }
    const subject = t("contact.subject", { name: values.name.trim() });
    const body = `${values.message.trim()}\n\n${values.name.trim()} <${values.email.trim()}>`;
    window.location.href = `mailto:${siteConfig.contactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    toast(t("contact.opened", { email: siteConfig.contactEmail }));
  };

  const copyEmail = async () => {
    try {
      await copyText(siteConfig.contactEmail);
      toast.success(t("contact.emailCopied"));
    } catch {
      toast.error(t("community.linkCopyFailed"));
    }
  };

  const socials = [
    { href: siteConfig.social.telegram, label: "Telegram", icon: Send },
    { href: siteConfig.social.instagram, label: "Instagram", icon: Instagram },
    { href: siteConfig.social.github, label: "GitHub", icon: Github },
  ].filter((social) => social.href);

  return (
    <div className="mx-auto max-w-4xl animate-fade-in py-2 sm:py-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold sm:text-4xl">{t("contact.title")}</h1>
        <p className="mt-3 text-base text-muted-foreground sm:text-lg">{t("contact.subtitle")}</p>
      </header>

      <div className="grid gap-6 lg:grid-cols-5">
        <form onSubmit={handleSubmit} noValidate className="space-y-4 rounded-2xl border border-border bg-card p-5 lg:col-span-3">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor={`${formId}-name`}>{t("contact.name")}</Label>
              <Input {...fieldProps("name")} autoComplete="name" maxLength={60} />
              {fieldError("name")}
            </div>
            <div className="space-y-2">
              <Label htmlFor={`${formId}-email`}>{t("contact.email")}</Label>
              <Input {...fieldProps("email")} type="email" autoComplete="email" dir="ltr" />
              {fieldError("email")}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${formId}-message`}>{t("contact.message")}</Label>
            <Textarea {...fieldProps("message")} rows={6} maxLength={2000} placeholder={t("contact.messagePlaceholder")} />
            {fieldError("message")}
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-muted-foreground">{t("contact.sendNote")}</p>
            <Button type="submit" className="shrink-0">
              <Send className="rtl:-scale-x-100" />
              {t("contact.send")}
            </Button>
          </div>
        </form>

        <aside className="space-y-4 rounded-2xl border border-border bg-card p-5 lg:col-span-2">
          <h2 className="text-lg font-semibold">{t("contact.directly")}</h2>
          <div className="flex items-center gap-2 rounded-lg bg-secondary/50 p-3">
            <Mail className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
            <a href={`mailto:${siteConfig.contactEmail}`} className="min-w-0 flex-1 truncate text-sm hover:underline" dir="ltr">
              {siteConfig.contactEmail}
            </a>
            <button
              type="button"
              onClick={() => void copyEmail()}
              aria-label={t("contact.copyEmail")}
              title={t("contact.copyEmail")}
              className="rounded p-1 text-muted-foreground transition-colors hover:text-foreground"
            >
              <Copy className="h-4 w-4" />
            </button>
          </div>
          {socials.length > 0 && (
            <ul className="space-y-2">
              {socials.map((social) => (
                <li key={social.label}>
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 rounded-lg p-3 text-sm transition-colors hover:bg-secondary/60"
                  >
                    <social.icon className="h-4 w-4 text-primary" aria-hidden="true" />
                    {social.label}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </aside>
      </div>
    </div>
  );
};

export default Contact;
