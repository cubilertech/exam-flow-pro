import React, { ReactNode, useState } from "react";
import { Navbar } from "@/components/core/Navbar";
import { useAppSelector } from "@/lib/hooks";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/core/AppSidebar";
import { matchPath, useLocation } from "react-router-dom";
import Footer from "@/components/footer/Footer";
import { Menu } from "lucide-react";

interface MainLayoutProps {
  children: ReactNode;
}

export const MainLayout = ({ children }: MainLayoutProps) => {
  const { isAuthenticated } = useAppSelector((state) => state.auth);
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const location = useLocation();
  const isHomePage = location.pathname === "/";
  const isCaseStudyPage = location.pathname === "/case-study-exams";
  const isExamPage = !!matchPath(
    "/case-study-exams/:examId",
    location.pathname,
  );
  const isSubjectPage = !!matchPath(
    "/case-study-exams/:examId/subjects/:subjectId",
    location.pathname,
  );
  const isCasePage = !!matchPath(
    "/case-study-exams/:examId/subjects/:subjectId/cases/:caseId",
    location.pathname,
  );

  return (
    <SidebarProvider>
      {/* <div className="min-h-screen flex w-full flex-col min-w-full bg-gradient-to-br from-background via-background to-muted/30"> */}
      <div className="min-h-screen flex w-full flex-col min-w-full bg-gradient-to-br from-background via-background to-muted/30">
        <Navbar />
        <div className="w-full sm:flex sm:flex-1">
          {(isAuthenticated && !isHomePage) ||
          (isAuthenticated && isHomePage) ? (
          <>

          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="md:hidden p-3 sticky mt-2 left-4 z-40 bg-secondary rounded-full shadow"
          >
            <Menu className="w-6 h-6"/>
          </button>
          <AppSidebar mobileSidebarOpen={mobileSidebarOpen} setMobileSidebarOpen={setMobileSidebarOpen} />
          </>
          ) : null}
          <SidebarInset className="flex-1">
            <main className=" p-4 ">{children}</main>
            {!isCaseStudyPage && !isExamPage && isSubjectPage && isCasePage && (
              <Footer />
            )}
          </SidebarInset>
        </div>
      </div>
    </SidebarProvider>
  );
};
