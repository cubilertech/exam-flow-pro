import React, { ReactNode } from "react";
import { Navbar } from "@/components/core/Navbar";
import { useAppSelector } from "@/lib/hooks";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/core/AppSidebar";
import { matchPath, useLocation } from "react-router-dom";
import Footer from "@/components/footer/Footer";

interface MainLayoutProps {
  children: ReactNode;
}

export const MainLayout = ({ children }: MainLayoutProps) => {
  const { isAuthenticated } = useAppSelector((state) => state.auth);
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
            <AppSidebar />
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
