import { Home, HelpCircle, FileText } from "lucide-react";
import { useLocation, Link } from "react-router-dom";
import { useAppSelector } from "@/lib/hooks";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export function AppSidebar() {
  const location = useLocation();
  const { user } = useAppSelector((state) => state.auth);
  const isAdmin = user?.isAdmin || false;

  // Define menu items based on role
  const studentMenuItems = [
    {
      title: "My Exams",
      url: "/my-exams",
      icon: FileText,
    },
  ];

  // Admin-only menu items
  const adminMenuItems = [
    {
      title: "Question Banks",
      url: "/questions",
      icon: HelpCircle,
    },
  ];

  // Use the appropriate menu items based on user role
  const menuItems = isAdmin ? adminMenuItems : studentMenuItems;

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="mt-12">
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === item.url}
                    tooltip={item.title}
                  >
                    <Link to={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
