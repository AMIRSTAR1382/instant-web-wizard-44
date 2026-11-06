import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CommunityCard } from "@/components/CommunityCard";
import { PageBanner } from "@/components/PageBanner";
import { usePreferences } from "@/context/PreferencesContext";
import { useCommunities } from "@/context/CommunitiesContext";
import { useDialogs } from "@/context/DialogsContext";
import { communityImages, getCategory, type CategoryId } from "@/data/communities";
import { useDocumentTitle } from "@/hooks/use-document-title";

/** One page for every category (/gaming, /music, …), driven by src/data/communities.ts. */
const CategoryPage = ({ categoryId }: { categoryId: CategoryId }) => {
  const { t, pick } = usePreferences();
  const { communities } = useCommunities();
  const { openCreateCommunity } = useDialogs();
  const category = getCategory(categoryId);
  useDocumentTitle(pick(category.name), { description: pick(category.tagline) });

  const items = communities
    .filter((community) => community.category === categoryId)
    .sort((a, b) => b.members - a.members);

  return (
    <div className="animate-fade-in space-y-8">
      <PageBanner
        image={communityImages[category.image]}
        title={pick(category.name)}
        eyebrow={
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary/25 text-primary">
            <category.icon className="h-5 w-5" aria-hidden="true" />
          </span>
        }
        subtitle={
          <>
            {pick(category.tagline)} · {t("category.count", { count: items.length })}
          </>
        }
        actions={
          <Button onClick={() => openCreateCommunity(categoryId)}>
            <Plus />
            {t("category.create")}
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 2xl:grid-cols-3">
        {items.map((community) => (
          <CommunityCard key={community.id} community={community} />
        ))}
      </div>
    </div>
  );
};

export default CategoryPage;
