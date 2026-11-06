import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Plus, Search, SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CommunityCard } from "@/components/CommunityCard";
import { usePreferences } from "@/context/PreferencesContext";
import { useCommunities } from "@/context/CommunitiesContext";
import { useDialogs } from "@/context/DialogsContext";
import { categories, communityMatches, isCategoryId } from "@/data/communities";
import { useDocumentTitle } from "@/hooks/use-document-title";
import { cn } from "@/lib/utils";

type SortKey = "popular" | "newest" | "name";
const sortKeys: SortKey[] = ["popular", "newest", "name"];
const isSortKey = (value: unknown): value is SortKey => sortKeys.includes(value as SortKey);

/** All communities, with search (?q=), a category or "joined" filter (?category=) and sorting (?sort=). */
const Explore = () => {
  const { t, pick, locale } = usePreferences();
  const { communities, isJoined } = useCommunities();
  const { openCreateCommunity } = useDialogs();
  const [params, setParams] = useSearchParams();
  useDocumentTitle(t("explore.title"), { description: t("explore.subtitle") });

  const query = params.get("q") ?? "";
  const rawFilter = params.get("category");
  const filter = rawFilter === "joined" || isCategoryId(rawFilter) ? rawFilter : "all";
  const rawSort = params.get("sort");
  const sort: SortKey = isSortKey(rawSort) ? rawSort : "popular";

  const setParam = (key: string, value: string | null) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true });
  };

  const results = useMemo(() => {
    const filtered = communities.filter((community) => {
      if (filter === "joined" && !isJoined(community.id)) return false;
      if (filter !== "all" && filter !== "joined" && community.category !== filter) return false;
      return communityMatches(community, query);
    });
    const collator = new Intl.Collator(locale === "fa" ? "fa" : "en");
    return filtered.sort((a, b) => {
      if (sort === "newest") return b.createdAt - a.createdAt;
      if (sort === "name") return collator.compare(pick(a.name), pick(b.name));
      return b.members - a.members;
    });
  }, [communities, filter, isJoined, query, sort, pick, locale]);

  const chips = [
    { id: "all", label: t("explore.all") },
    { id: "joined", label: t("explore.joined") },
    ...categories.map((category) => ({ id: category.id, label: pick(category.name) })),
  ];

  const hasFilters = query !== "" || filter !== "all";

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">{t("explore.title")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t("explore.subtitle")}</p>
        </div>
        <Button onClick={() => openCreateCommunity(isCategoryId(filter) ? filter : undefined)} className="self-start sm:self-auto">
          <Plus />
          {t("home.createCta")}
        </Button>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(event) => setParam("q", event.target.value || null)}
            placeholder={t("header.search")}
            aria-label={t("explore.searchLabel")}
            className="h-10 w-full rounded-lg border border-border bg-secondary pe-3 ps-9 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="shrink-0">{t("explore.sortLabel")}</span>
          <select
            value={sort}
            onChange={(event) => setParam("sort", event.target.value === "popular" ? null : event.target.value)}
            className="h-10 rounded-lg border border-border bg-secondary px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {sortKeys.map((key) => (
              <option key={key} value={key}>
                {t(`explore.sort.${key}`)}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div role="group" aria-label={t("explore.filterLabel")} className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        {chips.map((chip) => (
          <button
            key={chip.id}
            onClick={() => setParam("category", chip.id === "all" ? null : chip.id)}
            aria-pressed={filter === chip.id}
            className={cn(
              "shrink-0 whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
              filter === chip.id
                ? "bg-primary text-primary-foreground"
                : "bg-secondary/60 text-muted-foreground hover:bg-secondary hover:text-foreground",
            )}
          >
            {chip.label}
          </button>
        ))}
      </div>

      <p className="text-sm text-muted-foreground" aria-live="polite">
        {t("explore.results", { count: results.length })}
      </p>

      {results.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 2xl:grid-cols-3">
          {results.map((community) => (
            <CommunityCard key={community.id} community={community} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border px-4 py-16 text-center">
          <SearchX className="h-10 w-10 text-muted-foreground/50" aria-hidden="true" />
          <h2 className="text-lg font-semibold">{t("explore.emptyTitle")}</h2>
          <p className="max-w-sm text-sm text-muted-foreground">{t("explore.emptyText")}</p>
          <div className="mt-2 flex flex-wrap justify-center gap-2">
            {hasFilters && (
              <Button variant="outline" onClick={() => setParams({}, { replace: true })}>
                {t("explore.clearFilters")}
              </Button>
            )}
            <Button onClick={() => openCreateCommunity(isCategoryId(filter) ? filter : undefined)}>
              <Plus />
              {t("home.createCta")}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Explore;
