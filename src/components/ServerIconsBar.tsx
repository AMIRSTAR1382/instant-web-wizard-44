import type { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { Compass, Plus } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { usePreferences } from "@/context/PreferencesContext";
import { useCommunities } from "@/context/CommunitiesContext";
import { useDialogs } from "@/context/DialogsContext";
import { getCommunityImage } from "@/data/communities";
import { cn } from "@/lib/utils";

interface RailItemProps {
  label: string;
  active?: boolean;
  /** A link when `to` is set, otherwise a button. */
  to?: string;
  onClick?: () => void;
  children: ReactNode;
  className?: string;
}

const RailItem = ({ label, active, to, onClick, children, className }: RailItemProps) => {
  const { dir } = usePreferences();
  const classes = cn(
    "flex h-12 w-12 items-center justify-center overflow-hidden rounded-full transition-all duration-200",
    "hover:rounded-2xl focus-visible:rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
    active && "rounded-2xl ring-2 ring-primary",
    className,
  );

  return (
    <div className="relative flex w-full justify-center">
      {/* Discord-style pill on the outer edge marks the current page. */}
      <span
        aria-hidden="true"
        className={cn(
          "absolute start-0 top-1/2 w-1 -translate-y-1/2 rounded-e-full bg-foreground transition-all",
          active ? "h-8" : "h-0",
        )}
      />
      <Tooltip>
        <TooltipTrigger asChild>
          {to ? (
            <Link to={to} aria-label={label} aria-current={active ? "page" : undefined} className={classes}>
              {children}
            </Link>
          ) : (
            <button type="button" onClick={onClick} aria-label={label} className={classes}>
              {children}
            </button>
          )}
        </TooltipTrigger>
        <TooltipContent side={dir === "rtl" ? "left" : "right"}>{label}</TooltipContent>
      </Tooltip>
    </div>
  );
};

/** The narrow rail on the far side (desktop only): home, explore, joined communities and "+". */
export const ServerIconsBar = () => {
  const { t, pick, dir } = usePreferences();
  const { joinedCommunities } = useCommunities();
  const { openCreateCommunity } = useDialogs();
  const { pathname } = useLocation();

  return (
    <nav
      aria-label={t("servers.label")}
      className="fixed inset-y-0 start-0 z-20 hidden w-[72px] min-w-[72px] flex-col items-center overflow-hidden border-e border-sidebar-border bg-sidebar-background py-3 md:flex"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 120% 80% at ${dir === "rtl" ? "120%" : "-20%"} 50%, hsl(280 70% 50% / 0.6) 0%, hsl(300 60% 40% / 0.4) 30%, transparent 60%)`,
        }}
      />

      <div className="relative z-10 flex min-h-0 w-full flex-1 flex-col items-center gap-2">
        <RailItem to="/" label={t("servers.home")} active={pathname === "/"} className="bg-primary/20">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-lg font-bold text-primary-foreground">
            E
          </span>
        </RailItem>
        <RailItem
          to="/explore"
          label={t("servers.explore")}
          active={pathname === "/explore"}
          className="bg-sidebar-accent text-primary hover:bg-primary/20"
        >
          <Compass className="h-6 w-6" />
        </RailItem>

        <div className="my-1 h-0.5 w-8 shrink-0 rounded-full bg-sidebar-border" aria-hidden="true" />

        <div className="no-scrollbar flex min-h-0 w-full flex-1 flex-col items-center gap-2 overflow-y-auto py-1">
          {joinedCommunities.map((community) => (
            <RailItem
              key={community.id}
              to={`/community/${community.id}`}
              label={pick(community.name)}
              active={pathname === `/community/${community.id}`}
            >
              <img src={getCommunityImage(community.image)} alt="" className="h-full w-full object-cover" />
            </RailItem>
          ))}
          <RailItem
            label={t("servers.add")}
            onClick={() => openCreateCommunity()}
            className="bg-sidebar-accent text-primary hover:bg-primary/20"
          >
            <Plus className="h-6 w-6" />
          </RailItem>
        </div>
      </div>
    </nav>
  );
};
