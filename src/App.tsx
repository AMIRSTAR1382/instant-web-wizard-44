import { lazy } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MainLayout } from "./layouts/MainLayout";
import { PreferencesProvider } from "./context/PreferencesContext";
import { ProfileProvider } from "./context/ProfileContext";
import { CommunitiesProvider } from "./context/CommunitiesContext";
import { categories } from "./data/communities";

// Each page is downloaded only when it is first visited, which keeps the first load small.
const Index = lazy(() => import("./pages/Index"));
const Explore = lazy(() => import("./pages/Explore"));
const CategoryPage = lazy(() => import("./pages/CategoryPage"));
const CommunityPage = lazy(() => import("./pages/CommunityPage"));
const InfoPage = lazy(() => import("./pages/InfoPage"));
const Contact = lazy(() => import("./pages/Contact"));
const NotFound = lazy(() => import("./pages/NotFound"));

/*
 * Clean URLs (/gaming, /community/…). The host must send unknown paths to index.html;
 * ready-made settings for common hosts are in public/.htaccess, public/_redirects and
 * vercel.json (see DEPLOY.md).
 */
const App = () => (
  <PreferencesProvider>
    <ProfileProvider>
      <CommunitiesProvider>
        <TooltipProvider delayDuration={300}>
          <Toaster />
          <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <Routes>
              <Route element={<MainLayout />}>
                <Route path="/" element={<Index />} />
                <Route path="/explore" element={<Explore />} />
                {categories.map((category) => (
                  <Route key={category.id} path={`/${category.id}`} element={<CategoryPage categoryId={category.id} />} />
                ))}
                <Route path="/community/:id" element={<CommunityPage />} />
                <Route path="/about" element={<InfoPage page="about" />} />
                <Route path="/privacy" element={<InfoPage page="privacy" />} />
                <Route path="/terms" element={<InfoPage page="terms" />} />
                <Route path="/contact" element={<Contact />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </CommunitiesProvider>
    </ProfileProvider>
  </PreferencesProvider>
);

export default App;
