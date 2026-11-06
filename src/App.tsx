import { lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route } from "react-router-dom";
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
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

/*
 * HashRouter (URLs like /#/gaming) works on any static host and in sub-folders (vite.config
 * uses base "./"), with no server rewrite rules. If the site moves to a host that rewrites
 * unknown paths to index.html, BrowserRouter with base "/" gives cleaner URLs.
 */
const App = () => (
  <QueryClientProvider client={queryClient}>
    <PreferencesProvider>
      <ProfileProvider>
        <CommunitiesProvider>
          <TooltipProvider delayDuration={300}>
            <Toaster />
            <Sonner />
            <HashRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
              <Routes>
                <Route element={<MainLayout />}>
                  <Route path="/" element={<Index />} />
                  <Route path="/explore" element={<Explore />} />
                  {categories.map((category) => (
                    <Route key={category.id} path={`/${category.id}`} element={<CategoryPage categoryId={category.id} />} />
                  ))}
                  <Route path="/community/:id" element={<CommunityPage />} />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Route>
              </Routes>
            </HashRouter>
          </TooltipProvider>
        </CommunitiesProvider>
      </ProfileProvider>
    </PreferencesProvider>
  </QueryClientProvider>
);

export default App;
