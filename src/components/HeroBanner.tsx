import { Link } from "react-router-dom";
import { Compass, Plus } from "lucide-react";
import heroBanner from "@/assets/hero-banner.webp";
import { Button } from "@/components/ui/button";
import { usePreferences } from "@/context/PreferencesContext";
import { useDialogs } from "@/context/DialogsContext";

export const HeroBanner = () => {
  const { t } = usePreferences();
  const { openCreateCommunity } = useDialogs();

  return (
    <section className="relative overflow-hidden rounded-2xl shadow-card">
      <img src={heroBanner} alt="" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/20" />
      <div className="relative flex min-h-[15rem] flex-col items-center justify-center gap-3 px-4 py-10 text-center sm:min-h-[17rem]">
        <h1 className="text-2xl font-bold text-foreground drop-shadow-lg sm:text-4xl">{t("home.heroTitle")}</h1>
        <p className="max-w-xl text-sm text-foreground/80 sm:text-base">{t("home.heroSubtitle")}</p>
        <div className="mt-2 flex flex-wrap justify-center gap-3">
          <Button asChild>
            <Link to="/explore">
              <Compass />
              {t("home.exploreCta")}
            </Link>
          </Button>
          <Button variant="secondary" onClick={() => openCreateCommunity()}>
            <Plus />
            {t("home.createCta")}
          </Button>
        </div>
      </div>
    </section>
  );
};
