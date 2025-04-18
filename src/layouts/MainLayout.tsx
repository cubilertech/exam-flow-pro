
import React, { ReactNode } from "react";
import { Navbar } from "@/components/core/Navbar";
import { useAppSelector } from "@/lib/hooks";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/core/AppSidebar";
import { useLocation } from "react-router-dom";

interface MainLayoutProps {
  children: ReactNode;
}

export const MainLayout = ({ children }: MainLayoutProps) => {
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  return (
    <SidebarProvider>
      <div className="min-h-screen flex flex-col w-full bg-background">
        <Navbar />
        <div className="flex flex-1">
          {!isHomePage && <AppSidebar />}
          <SidebarInset className="flex-1">
            <main className="flex-1 p-4">
              {children}
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
