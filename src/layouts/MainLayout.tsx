
import { Outlet } from "react-router-dom";
import { Navbar } from "@/components/core/Navbar";
import { useAppSelector } from "@/lib/hooks";

export const MainLayout = () => {
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="py-6 border-t">
        <div className="container text-center text-sm text-muted-foreground">
          <p>© 2025 ExamFlowPro. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};
