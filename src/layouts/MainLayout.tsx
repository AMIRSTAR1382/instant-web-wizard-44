import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { UserActivity } from "@/components/UserActivity";
import { Outlet } from "react-router-dom";

export const MainLayout = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        
        <main className="flex-1 flex flex-col">
          <header className="h-14 border-b border-border flex items-center px-4 sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10">
            <SidebarTrigger className="mr-4" />
            <div className="flex-1 max-w-2xl">
              <input
                type="text"
                placeholder="Search communities..."
                className="w-full px-4 py-2 rounded-lg bg-secondary border border-border focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              />
            </div>
          </header>

          <div className="flex flex-1">
            <div className="flex-1 p-6 overflow-y-auto">
              <Outlet />
            </div>
            <UserActivity />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};
