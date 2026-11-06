import { Link, useNavigate, useParams } from "react-router-dom";
import { Check, Hash, Link2, LogOut, Plus, ShieldCheck, Trash2, Users } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { CommunityCard } from "@/components/CommunityCard";
import { PageBanner } from "@/components/PageBanner";
import { usePreferences } from "@/context/PreferencesContext";
import { useCommunities } from "@/context/CommunitiesContext";
import { getCategory, getCommunityImage } from "@/data/communities";
import { useDocumentTitle } from "@/hooks/use-document-title";
import type { TranslationKey } from "@/i18n/en";
import { copyText } from "@/lib/utils";

const channels: TranslationKey[] = [
  "community.channel.general",
  "community.channel.announcements",
  "community.channel.introductions",
  "community.channel.media",
];
const rules: TranslationKey[] = ["community.rule1", "community.rule2", "community.rule3"];

const CommunityPage = () => {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const { t, pick, formatCompact, formatNumber, formatRelative } = usePreferences();
  const { communities, getCommunity, isJoined, join, leave, deleteCommunity } = useCommunities();
  const community = getCommunity(id);
  useDocumentTitle(community ? pick(community.name) : t("community.notFoundTitle"), {
    description: community ? pick(community.description) : undefined,
    noIndex: !community,
  });

  if (!community) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-center">
        <h1 className="text-2xl font-bold">{t("community.notFoundTitle")}</h1>
        <p className="text-muted-foreground">{t("community.notFoundText")}</p>
        <Button asChild className="mt-2">
          <Link to="/explore">{t("community.backToExplore")}</Link>
        </Button>
      </div>
    );
  }

  const name = pick(community.name);
  const category = getCategory(community.category);
  const joined = isJoined(community.id);
  // Count the visitor in once they join.
  const members = community.members + (joined && !community.createdByUser ? 1 : 0);
  const similar = communities
    .filter((item) => item.category === community.category && item.id !== community.id)
    .sort((a, b) => b.members - a.members)
    .slice(0, 3);

  const toggleMembership = () => {
    if (joined) {
      leave(community.id);
      toast(t("community.leftToast", { name }));
    } else {
      join(community.id);
      toast.success(t("community.joinedToast", { name }));
    }
  };

  const copyLink = async () => {
    try {
      await copyText(window.location.href);
      toast.success(t("community.linkCopied"));
    } catch {
      toast.error(t("community.linkCopyFailed"));
    }
  };

  const handleDelete = () => {
    deleteCommunity(community.id);
    toast(t("community.deleted"));
    navigate("/explore", { replace: true });
  };

  return (
    <div className="animate-fade-in space-y-8">
      <PageBanner
        image={getCommunityImage(community.image)}
        title={name}
        eyebrow={
          <Link
            to={`/${category.id}`}
            className="inline-flex items-center gap-1.5 rounded-full bg-background/70 px-3 py-1 text-xs font-medium backdrop-blur transition-colors hover:bg-background"
          >
            <category.icon className="h-3.5 w-3.5" aria-hidden="true" />
            {pick(category.name)}
          </Link>
        }
        subtitle={
          <span className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <span className="inline-flex items-center gap-1.5">
              <Users className="h-4 w-4" aria-hidden="true" />
              {t("community.members", { count: formatCompact(members) })}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-green-500" aria-hidden="true" />
              {t("community.online", { count: formatCompact(community.online) })}
            </span>
          </span>
        }
        actions={
          <>
            <Button onClick={toggleMembership} variant={joined ? "secondary" : "default"} aria-pressed={joined}>
              {joined ? <LogOut className="rtl:rotate-180" /> : <Plus />}
              {joined ? t("community.leave") : t("community.join")}
            </Button>
            <Button variant="secondary" onClick={() => void copyLink()}>
              <Link2 />
              {t("community.share")}
            </Button>
            {community.createdByUser && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">
                    <Trash2 />
                    {t("community.delete")}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>{t("community.deleteTitle")}</AlertDialogTitle>
                    <AlertDialogDescription>{t("community.deleteText", { name })}</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                      {t("community.delete")}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <section aria-labelledby="community-about" className="rounded-2xl border border-border bg-card p-5 lg:col-span-2">
          <h2 id="community-about" className="mb-3 text-lg font-semibold">
            {t("community.about")}
          </h2>
          <p className="leading-relaxed text-muted-foreground">{pick(community.description)}</p>
          {community.createdByUser && (
            <p className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-3 py-1 text-xs font-medium text-primary">
              <Check className="h-3.5 w-3.5" aria-hidden="true" />
              {t("community.createdByYou")} · {formatRelative(community.createdAt)}
            </p>
          )}

          <h2 className="mb-3 mt-6 text-lg font-semibold">{t("community.rules")}</h2>
          <ol className="space-y-2">
            {rules.map((rule, index) => (
              <li key={rule} className="flex gap-3 text-sm text-muted-foreground">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-foreground">
                  {formatNumber(index + 1)}
                </span>
                {t(rule)}
              </li>
            ))}
          </ol>
        </section>

        <section aria-labelledby="community-channels" className="rounded-2xl border border-border bg-card p-5">
          <h2 id="community-channels" className="mb-3 text-lg font-semibold">
            {t("community.channels")}
          </h2>
          <ul className="space-y-1">
            {channels.map((channel) => (
              <li key={channel} className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm text-muted-foreground">
                <Hash className="h-4 w-4 shrink-0" aria-hidden="true" />
                {t(channel)}
              </li>
            ))}
          </ul>
          <p className="mt-4 flex gap-2 rounded-lg bg-secondary/60 p-3 text-xs text-muted-foreground">
            <ShieldCheck className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
            {t("community.channelsNote")}
          </p>
        </section>
      </div>

      {similar.length > 0 && (
        <section aria-labelledby="community-similar">
          <h2 id="community-similar" className="mb-4 text-lg font-bold sm:text-xl">
            {t("community.similar")}
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 2xl:grid-cols-3">
            {similar.map((item) => (
              <CommunityCard key={item.id} community={item} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default CommunityPage;
