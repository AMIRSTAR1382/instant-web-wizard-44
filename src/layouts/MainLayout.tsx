import { useState } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { ServerIconsBar } from "@/components/ServerIconsBar";
import { UserActivity } from "@/components/UserActivity";
import { Outlet } from "react-router-dom";
import { User } from "lucide-react";

export const MainLayout = () => {
  const [rightSidebarOpen, setRightSidebarOpen] = useState(false);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background md:pl-[72px]">
        <ServerIconsBar />
        <AppSidebar />
        
        <main className="flex-1 flex flex-col min-w-0">
          <header className="h-14 border-b border-border flex items-center px-3 sm:px-4 sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10">
            <SidebarTrigger className="mr-2 sm:mr-4" />
            <div className="flex-1 max-w-2xl">
              <input
                type="text"
                placeholder="Search communities..."
                className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base rounded-lg bg-secondary border border-border focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              />
            </div>
            {/* Right sidebar trigger for mobile/tablet */}
            <button
              onClick={() => setRightSidebarOpen(true)}
              className="xl:hidden ml-2 sm:ml-4 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center hover:scale-110 transition-transform shrink-0"
            >
              <User className="w-4 h-4 sm:w-5 sm:h-5 text-primary-foreground" />
            </button>
          </header>

          <div className="flex flex-1 relative overflow-hidden">
            <div className="flex-1 p-3 sm:p-4 md:p-6 overflow-y-auto">
              <Outlet />
            </div>
            <UserActivity 
              isOpen={rightSidebarOpen} 
              onClose={() => setRightSidebarOpen(false)} 
            />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};