import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Compass, Home, Info, Mail, Search, Users } from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { usePreferences } from "@/context/PreferencesContext";
import { useCommunities } from "@/context/CommunitiesContext";
import { categories, getCommunityImage } from "@/data/communities";

interface SearchCommandProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** The search palette: Ctrl+K, "/" or the search box in the header. */
export const SearchCommand = ({ open, onOpenChange }: SearchCommandProps) => {
  const navigate = useNavigate();
  const { t, pick, formatCompact } = usePreferences();
  const { communities } = useCommunities();
  const [query, setQuery] = useState("");
  const trimmed = query.trim();

  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  const go = (path: string) => {
    onOpenChange(false);
    navigate(path);
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange} title={t("search.title")}>
      <CommandInput value={query} onValueChange={setQuery} placeholder={t("search.placeholder")} />
      <CommandList className="max-h-[min(60vh,400px)]">
        <CommandEmpty>{t("search.empty")}</CommandEmpty>

        {trimmed && (
          <CommandGroup>
            <CommandItem
              forceMount
              value={`__all__${trimmed}`}
              onSelect={() => go(`/explore?q=${encodeURIComponent(trimmed)}`)}
            >
              <Search />
              <span className="truncate">{t("search.seeAll", { query: trimmed })}</span>
            </CommandItem>
          </CommandGroup>
        )}

        <CommandGroup heading={t("search.pages")}>
          <CommandItem value="page:home" keywords={["home", "خانه"]} onSelect={() => go("/")}>
            <Home />
            {t("nav.home")}
          </CommandItem>
          <CommandItem value="page:explore" keywords={["explore", "اکسپلور", "all", "همه"]} onSelect={() => go("/explore")}>
            <Compass />
            {t("nav.explore")}
          </CommandItem>
          <CommandItem value="page:about" keywords={["about", "درباره"]} onSelect={() => go("/about")}>
            <Info />
            {t("footer.about")}
          </CommandItem>
          <CommandItem value="page:contact" keywords={["contact", "email", "تماس", "ایمیل"]} onSelect={() => go("/contact")}>
            <Mail />
            {t("footer.contact")}
          </CommandItem>
          {categories.map((category) => (
            <CommandItem
              key={category.id}
              value={`page:${category.id}`}
              keywords={[category.name.en, category.name.fa]}
              onSelect={() => go(`/${category.id}`)}
            >
              <category.icon />
              {pick(category.name)}
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandGroup heading={t("search.communities")}>
          {communities.map((community) => (
            <CommandItem
              key={community.id}
              value={`community:${community.id}`}
              keywords={[community.name.en, community.name.fa, community.description.en, community.description.fa]}
              onSelect={() => go(`/community/${community.id}`)}
            >
              <img
                src={getCommunityImage(community.image)}
                alt=""
                className="h-7 w-7 shrink-0 rounded-full object-cover"
              />
              <span className="truncate">{pick(community.name)}</span>
              <span className="ms-auto flex shrink-0 items-center gap-1 text-xs text-muted-foreground [&_svg]:!h-3.5 [&_svg]:!w-3.5">
                <Users />
                {formatCompact(community.members)}
              </span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
};
