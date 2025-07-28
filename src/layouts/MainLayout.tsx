import React, { ReactNode } from "react";
import { Navbar } from "@/components/core/Navbar";
import { useAppSelector } from "@/lib/hooks";
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
  const isExamPage = !!matchPath("/case-study-exams/:examId", location.pathname);
  const isSubjectPage = !!matchPath("/case-study-exams/:examId/subjects/:subjectId", location.pathname);
  const isCasePage = !!matchPath("/case-study-exams/:examId/subjects/:subjectId/cases/:caseId", location.pathname);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      {/* Fixed Sidebar */}
      {!isHomePage && (
        <div className="fixed left-0 top-0 h-full w-60 border-r bg-secondary z-30">
          <div className="mt-[100px]">
            <AppSidebar />
          </div>
        </div>
      )}

      {/* Fixed Navbar */}
      <div className="fixed top-0 w-full h-16 z-40 bg-background border-b">
        <Navbar />
      </div>

      {/* Main Content Area */}
      <div className={`pt-16 ${!isHomePage ? "pl-60" : ""} min-h-screen`}>
        <main className="p-4">
          {children}
        </main>

        {!isCaseStudyPage && !isExamPage && isSubjectPage && isCasePage && <Footer />}
      </div>
    </div>
  );
};
