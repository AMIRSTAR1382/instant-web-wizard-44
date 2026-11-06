import { usePreferences } from "@/context/PreferencesContext";
import { infoPages, type InfoPageId } from "@/data/pages";
import { useDocumentTitle } from "@/hooks/use-document-title";
import { intlLocale } from "@/lib/i18n";

/** The About, Privacy and Terms pages; their text lives in src/data/pages.ts. */
const InfoPage = ({ page }: { page: InfoPageId }) => {
  const { t, pick, locale } = usePreferences();
  const content = infoPages[page];
  useDocumentTitle(pick(content.title), { description: pick(content.description) });

  const updated = content.updated
    ? new Intl.DateTimeFormat(intlLocale(locale), { dateStyle: "long" }).format(new Date(`${content.updated}T12:00:00Z`))
    : null;

  return (
    <article className="mx-auto max-w-3xl animate-fade-in py-2 sm:py-6">
      <header className="mb-8 border-b border-border pb-6">
        <h1 className="text-3xl font-bold sm:text-4xl">{pick(content.title)}</h1>
        <p className="mt-3 text-base text-muted-foreground sm:text-lg">{pick(content.description)}</p>
        {updated && <p className="mt-3 text-xs text-muted-foreground">{t("info.updated", { date: updated })}</p>}
      </header>

      <div className="space-y-8">
        {content.sections.map((section) => (
          <section key={section.heading.en}>
            <h2 className="mb-3 text-xl font-semibold">{pick(section.heading)}</h2>
            <div className="space-y-3 leading-relaxed text-muted-foreground">
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph.en}>{pick(paragraph)}</p>
              ))}
            </div>
          </section>
        ))}
      </div>
    </article>
  );
};

export default InfoPage;
