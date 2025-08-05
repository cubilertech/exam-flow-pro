import {
  BookOpen,
  Briefcase,
  Calendar,
  CheckSquare,
  Database,
  LayoutDashboard,
  ListChecks,
  MessagesSquare,
  Settings,
  User,
  Users,
  Flag,
  Menu, X
} from "lucide-react";


import { useAppSelector } from "@/lib/hooks";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { NavLink } from "react-router-dom";
import { useState } from "react";

interface MainNavItem {
  title: string;
  url: string;
  icon: any;
}

interface SidebarNavItem {
  title: string;
  url: string;
  icon: any;
}

interface DashboardConfig {
  mainNav: MainNavItem[];
  sidebarNav: SidebarNavItem[];
}
interface AppSidebarProps {
  mobileSidebarOpen: boolean;
  setMobileSidebarOpen: (value: boolean) => void;
}

export function AppSidebar({ mobileSidebarOpen, setMobileSidebarOpen }: AppSidebarProps) {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const adminItems = [
    { title: "Question Banks", url: "/questions", icon: Database },
    { title: "User Management", url: "/users", icon: Users },
    { title: "Case Study Exams", url: "/case-study-exams", icon: BookOpen },
  ];

  const studentItems = [
    { title: "Dashboard", url: "/", icon: LayoutDashboard },
    { title: "My Exams", url: "/my-exams", icon: BookOpen },
    { title: "Flagged Questions", url: "/flagged-questions", icon: Flag },
    { title: "Case Study Exams", url: "/case-study-exams", icon: BookOpen },
  ];

  return (
    <>
      {/* Mobile Sidebar Overlay */}
      {/* <div
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity duration-300 ${
          mobileSidebarOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setMobileSidebarOpen(false)}
      /> */}

      {/* Mobile Sidebar Drawer */}
      <div
        className={`fixed top-0 left-0 z-50 h-full w-96 bg-secondary border-r transform transition-transform duration-300 ${
          mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:hidden`}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h2 className="text-lg font-bold">{user?.isAdmin ? "Admin" : "Student"} Dashboard</h2>
          <button className="pr-3" onClick={() => setMobileSidebarOpen(false)}>
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="grid gap-1 px-3 py-2">
          {(user?.isAdmin ? adminItems : studentItems).map((item) => (
            <NavLink
              key={item.title}
              to={item.url}
              onClick={() => setMobileSidebarOpen(false)}
              className="flex items-center space-x-2 rounded-md p-2 text-sm font-medium hover:underline"
            >
              <item.icon className="h-4 w-4" />
              <span>{item.title}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Desktop Sidebar */}
      <div className="w-60 flex-shrink-0 border-r bg-secondary md:block hidden">
        <div className="flex h-full max-h-screen flex-col gap-2 py-2 ">
          <div className="relative px-3 py-2">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>
                  {user?.isAdmin ? "Admin" : "Student"} Dashboard
                </AccordionTrigger>

                <nav className="grid gap-1">
                  {(user?.isAdmin ? adminItems : studentItems).map((item) => (
                    <NavLink
                      key={item.title}
                      to={item.url}
                      className="flex items-center space-x-2 rounded-md p-2 text-sm font-medium hover:underline"
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  ))}
                </nav>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </div>
    </>
  );
}

