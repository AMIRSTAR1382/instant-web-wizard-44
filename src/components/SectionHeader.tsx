import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { usePreferences } from "@/context/PreferencesContext";

interface SectionHeaderProps {
  title: string;
  /** Where "See all" goes; leave out to hide the link. */
  seeAllTo?: string;
  id?: string;
}

export const SectionHeader = ({ title, seeAllTo, id }: SectionHeaderProps) => {
  const { t } = usePreferences();
  return (
    <div className="mb-4 flex items-center justify-between gap-4 sm:mb-6">
      <h2 id={id} className="text-lg font-bold sm:text-xl md:text-2xl">
        {title}
      </h2>
      {seeAllTo && (
        <Link
          to={seeAllTo}
          className="inline-flex shrink-0 items-center gap-1 rounded-md text-xs text-muted-foreground transition-colors hover:text-foreground sm:text-sm"
        >
          {t("common.seeAll")}
          <ChevronRight className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
        </Link>
      )}
    </div>
  );
};
