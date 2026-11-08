import { useEffect, useId, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Check } from "lucide-react";
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
import { usePreferences } from "@/context/PreferencesContext";
import { useCommunities } from "@/context/CommunitiesContext";
import {
  categories,
  communityImageKeys,
  communityImages,
  getCategory,
  type CategoryId,
  type CommunityImageKey,
} from "@/data/communities";
import type { TranslationKey } from "@/i18n/en";
import { errorMessageKey } from "@/lib/backend/messages";
import { cn } from "@/lib/utils";

const NAME_MAX = 40;
const ABOUT_MAX = 200;

interface CreateCommunityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialCategory?: CategoryId;
}

export const CreateCommunityDialog = ({ open, onOpenChange, initialCategory }: CreateCommunityDialogProps) => {
  const { t, pick } = usePreferences();
  const { createCommunity } = useCommunities();
  const navigate = useNavigate();
  const formId = useId();

  const [name, setName] = useState("");
  const [about, setAbout] = useState("");
  const [category, setCategory] = useState<CategoryId>(initialCategory ?? "gaming");
  const [image, setImage] = useState<CommunityImageKey>(getCategory(initialCategory ?? "gaming").image);
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState<TranslationKey | null>(null);

  // Start from a clean form every time the dialog opens.
  useEffect(() => {
    if (!open) return;
    const startCategory = initialCategory ?? "gaming";
    setName("");
    setAbout("");
    setCategory(startCategory);
    setImage(getCategory(startCategory).image);
    setSubmitted(false);
    setBusy(false);
    setFailure(null);
  }, [open, initialCategory]);

  const nameLength = name.trim().length;
  const aboutLength = about.trim().length;
  const nameError: TranslationKey | null =
    nameLength < 3 ? "create.errorNameShort" : nameLength > NAME_MAX ? "create.errorNameLong" : null;
  const aboutError: TranslationKey | null =
    aboutLength < 10 ? "create.errorAboutShort" : aboutLength > ABOUT_MAX ? "create.errorAboutLong" : null;

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (busy) return;
    setSubmitted(true);
    setFailure(null);
    if (nameError || aboutError) {
      document.getElementById(nameError ? `${formId}-name` : `${formId}-about`)?.focus();
      return;
    }
    setBusy(true);
    try {
      const community = await createCommunity({ name, description: about, category, image });
      onOpenChange(false);
      toast.success(t("create.created", { name: pick(community.name) }));
      navigate(`/community/${community.id}`);
    } catch (error) {
      setFailure(errorMessageKey(error));
    } finally {
      setBusy(false);
    }
  };

  const showNameError = submitted && nameError;
  const showAboutError = submitted && aboutError;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("create.title")}</DialogTitle>
          <DialogDescription>{t("create.description")}</DialogDescription>
        </DialogHeader>

        <form id={formId} onSubmit={(event) => void handleSubmit(event)} noValidate className="space-y-5">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor={`${formId}-name`}>{t("create.name")}</Label>
              <span className="text-xs text-muted-foreground" aria-hidden="true">
                {t("create.charCount", { count: nameLength, max: NAME_MAX })}
              </span>
            </div>
            <Input
              id={`${formId}-name`}
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder={t("create.namePlaceholder")}
              maxLength={NAME_MAX + 10}
              autoComplete="off"
              aria-invalid={Boolean(showNameError)}
              aria-describedby={showNameError ? `${formId}-name-error` : undefined}
            />
            {showNameError && (
              <p id={`${formId}-name-error`} className="text-xs text-destructive">
                {t(nameError)}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor={`${formId}-about`}>{t("create.about")}</Label>
              <span className="text-xs text-muted-foreground" aria-hidden="true">
                {t("create.charCount", { count: aboutLength, max: ABOUT_MAX })}
              </span>
            </div>
            <Textarea
              id={`${formId}-about`}
              value={about}
              onChange={(event) => setAbout(event.target.value)}
              placeholder={t("create.aboutPlaceholder")}
              rows={3}
              maxLength={ABOUT_MAX + 20}
              aria-invalid={Boolean(showAboutError)}
              aria-describedby={showAboutError ? `${formId}-about-error` : undefined}
            />
            {showAboutError && (
              <p id={`${formId}-about-error`} className="text-xs text-destructive">
                {t(aboutError)}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor={`${formId}-category`}>{t("create.category")}</Label>
            <select
              id={`${formId}-category`}
              value={category}
              onChange={(event) => {
                const next = event.target.value as CategoryId;
                setCategory(next);
                setImage(getCategory(next).image);
              }}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {categories.map((option) => (
                <option key={option.id} value={option.id}>
                  {pick(option.name)}
                </option>
              ))}
            </select>
          </div>

          <fieldset className="space-y-2">
            <legend className="text-sm font-medium">{t("create.cover")}</legend>
            <div className="grid grid-cols-5 gap-2">
              {communityImageKeys.map((key, index) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setImage(key)}
                  aria-pressed={image === key}
                  aria-label={t("create.coverOption", { number: index + 1 })}
                  className={cn(
                    "relative aspect-square overflow-hidden rounded-lg border-2 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    image === key ? "border-primary" : "border-transparent opacity-70 hover:opacity-100",
                  )}
                >
                  <img src={communityImages[key]} alt="" className="h-full w-full object-cover" />
                  {image === key && (
                    <span className="absolute inset-0 flex items-center justify-center bg-primary/30">
                      <Check className="h-5 w-5 text-primary-foreground drop-shadow" />
                    </span>
                  )}
                </button>
              ))}
            </div>
          </fieldset>

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
            {t(busy ? "create.creating" : "create.submit")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
