
import { Outlet } from "react-router-dom";
import { Navbar } from "@/components/core/Navbar";
import { useAppSelector } from "@/lib/hooks";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/core/AppSidebar";

export const MainLayout = () => {
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex flex-col w-full bg-background">
        <Navbar />
        <div className="flex flex-1">
          <AppSidebar />
          <SidebarInset className="flex-1">
            <main className="flex-1 p-4">
              <Outlet />
            </main>
            <footer className="py-6 border-t">
              <div className="container text-center text-sm text-muted-foreground">
                <p>© 2025 ExamFlowPro. All rights reserved.</p>
              </div>
            </footer>
          </SidebarInset>
        </div>
      </div>
    </SidebarProvider>
  );
};
