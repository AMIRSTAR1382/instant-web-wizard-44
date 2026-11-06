import type { ReactNode } from "react";

interface PageBannerProps {
  image: string;
  title: string;
  subtitle?: ReactNode;
  /** Small label above the title, e.g. the category. */
  eyebrow?: ReactNode;
  /** Buttons shown next to (or under, on phones) the title. */
  actions?: ReactNode;
}

/** The wide image header used by category and community pages. */
export const PageBanner = ({ image, title, subtitle, eyebrow, actions }: PageBannerProps) => (
  <header className="relative overflow-hidden rounded-2xl shadow-card">
    <img src={image} alt="" className="absolute inset-0 h-full w-full object-cover" />
    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
    <div className="relative flex min-h-[12rem] flex-col justify-end gap-4 p-4 sm:min-h-[16rem] sm:flex-row sm:items-end sm:justify-between sm:p-8">
      <div className="min-w-0">
        {eyebrow && <div className="mb-2">{eyebrow}</div>}
        <h1 className="mb-1 text-2xl font-bold sm:text-4xl">{title}</h1>
        {subtitle && <div className="text-sm text-muted-foreground sm:text-base">{subtitle}</div>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
    </div>
  </header>
);
