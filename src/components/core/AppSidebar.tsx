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
} from "lucide-react";

import { useAppSelector } from "@/lib/hooks";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { NavLink } from "react-router-dom";

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

export function AppSidebar() {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  const adminItems = [
    {
      title: "Dashboard",
      url: "/",
      icon: LayoutDashboard,
    },
    {
      title: "Question Banks",
      url: "/questions",
      icon: Database,
    },
    
    {
      title: "User Management",
      url: "/users",
      icon: Users,
    },
    {
      title: "Case Study Exams",
      url: "/case-study-exams",
      icon: BookOpen,
    },
    
  ];

  const studentItems = [
     {
      title: "Dashboard",
      url: "/",
      icon: LayoutDashboard,
    },
    {
      title: "My Exams",
      url: "/my-exams",
      icon: BookOpen,
    },
    {
      title: "Flagged Questions",
      url: "/flagged-questions",
      icon: Flag,
    },
    {
      title: "Case Study Exams",
      url: "/case-study-exams",
      icon: BookOpen,
    },
  ];

  return (
    <div className="w-60 flex-shrink-0 border-r bg-secondary">
      <div className="flex h-full max-h-screen flex-col gap-2 py-2 ">
        {/* <NavLink to={"/"}>
          <div className="px-3 py-2 text-center bg-slate-500">
            <h2 className="font-bold text-2xl">Dashboard</h2>
            <span className="text-xs">Manage your account</span>
          </div>
        </NavLink> */}
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
  );
}
