import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { usePreferences } from "@/context/PreferencesContext";
import { useDocumentTitle } from "@/hooks/use-document-title";

const NotFound = () => {
  const location = useLocation();
  const { t, formatNumber } = usePreferences();
  useDocumentTitle(t("notFound.title"), { noIndex: true });

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <p className="bg-gradient-accent bg-clip-text text-7xl font-bold text-transparent sm:text-8xl" aria-hidden="true">
        {formatNumber(404).replace(/[,٬]/g, "")}
      </p>
      <h1 className="mt-4 text-xl font-semibold sm:text-2xl">{t("notFound.title")}</h1>
      <p className="mt-2 max-w-md text-muted-foreground">{t("notFound.text")}</p>
      <Button asChild className="mt-6">
        <Link to="/">{t("notFound.home")}</Link>
      </Button>
    </div>
  );
};

export default NotFound;
