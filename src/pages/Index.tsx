import { Link } from "react-router-dom";
import { HeroBanner } from "@/components/HeroBanner";
import { CommunityCard } from "@/components/CommunityCard";
import { SectionHeader } from "@/components/SectionHeader";
import { usePreferences } from "@/context/PreferencesContext";
import { useCommunities } from "@/context/CommunitiesContext";
import { categories, communityImages, getCommunityImage } from "@/data/communities";
import { useDocumentTitle } from "@/hooks/use-document-title";

const Index = () => {
  const { t, pick } = usePreferences();
  const { communities, joinedCommunities } = useCommunities();
  useDocumentTitle();

  const featured = communities.filter((community) => community.featured);
  const popular = [...communities].sort((a, b) => b.members - a.members).slice(0, 6);
  const countByCategory = (id: string) => communities.filter((community) => community.category === id).length;

  return (
    <div className="animate-fade-in space-y-10 sm:space-y-12">
      <HeroBanner />

      {joinedCommunities.length > 0 && (
        <section aria-labelledby="home-joined">
          <SectionHeader id="home-joined" title={t("home.yourCommunities")} seeAllTo="/explore?category=joined" />
          <ul className="no-scrollbar -mx-1 flex gap-3 overflow-x-auto px-1 pb-1">
            {joinedCommunities.map((community) => (
              <li key={community.id} className="shrink-0">
                <Link
                  to={`/community/${community.id}`}
                  className="flex items-center gap-3 rounded-full border border-border bg-card py-1.5 pe-4 ps-1.5 transition-colors hover:border-primary/50 hover:bg-secondary"
                >
                  <img
                    src={getCommunityImage(community.image)}
                    alt=""
                    className="h-8 w-8 rounded-full object-cover"
                  />
                  <span className="max-w-[12rem] truncate text-sm font-medium">{pick(community.name)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section aria-labelledby="home-featured">
        <SectionHeader id="home-featured" title={t("home.featured")} seeAllTo="/explore" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
          {featured.map((community) => (
            <CommunityCard key={community.id} community={community} />
          ))}
        </div>
      </section>

      <section aria-labelledby="home-categories">
        <SectionHeader id="home-categories" title={t("home.categories")} />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
          {categories.map((category) => (
            <Link
              key={category.id}
              to={`/${category.id}`}
              className="group relative flex h-24 items-end overflow-hidden rounded-xl p-3 shadow-card sm:h-28 sm:p-4"
            >
              <img
                src={communityImages[category.image]}
                alt=""
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/10" />
              <div className="relative flex w-full items-center gap-2">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary">
                  <category.icon className="h-4 w-4" aria-hidden="true" />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold sm:text-base">{pick(category.name)}</span>
                  <span className="block text-xs text-muted-foreground">
                    {t("category.count", { count: countByCategory(category.id) })}
                  </span>
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section aria-labelledby="home-popular">
        <SectionHeader id="home-popular" title={t("home.popular")} seeAllTo="/explore?sort=popular" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 2xl:grid-cols-3">
          {popular.map((community) => (
            <CommunityCard key={community.id} community={community} />
          ))}
        </div>
      </section>
    </div>
  );
};

export default Index;
