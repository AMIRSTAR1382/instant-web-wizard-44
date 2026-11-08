import { Link } from "react-router-dom";
import { Check, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePreferences } from "@/context/PreferencesContext";
import { useCommunities } from "@/context/CommunitiesContext";
import { getCommunityImage, type Community } from "@/data/communities";

interface CommunityCardProps {
  community: Community;
  className?: string;
}

/** A community tile that opens the community page. */
export const CommunityCard = ({ community, className }: CommunityCardProps) => {
  const { t, pick, formatCompact } = usePreferences();
  const { isJoined } = useCommunities();
  const joined = isJoined(community.id);

  return (
    <Link
      to={`/community/${community.id}`}
      className={cn(
        "group relative block overflow-hidden rounded-2xl bg-gradient-secondary shadow-card transition-all duration-300",
        "hover:-translate-y-1 hover:shadow-glow",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        className,
      )}
    >
      <div className="aspect-[4/3] w-full overflow-hidden">
        <img
          src={getCommunityImage(community.image)}
          alt=""
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
      </div>

      {joined && (
        <span className="absolute end-3 top-3 inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground shadow">
          <Check className="h-3 w-3" aria-hidden="true" />
          {t("community.joined")}
        </span>
      )}

      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background via-background/90 to-transparent p-4 pt-10 sm:p-5 sm:pt-12">
        <h3 className="line-clamp-1 text-lg font-bold sm:text-xl">{pick(community.name)}</h3>
        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{pick(community.description)}</p>
        <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Users className="h-3.5 w-3.5" aria-hidden="true" />
          {community.members === 1
                ? t("community.oneMember")
                : t("community.members", { count: formatCompact(community.members) })}
        </p>
      </div>
    </Link>
  );
};
