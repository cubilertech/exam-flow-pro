
import * as React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "@/lib/hooks";
import { logout } from "@/features/auth/authSlice";
import { signOut } from "@/services/authService";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, Book, TestTube, BarChart, HelpCircle, LogOut } from "lucide-react";
import { toast } from "sonner";

export const Navbar = () => {
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const isAdmin = user?.isAdmin || false;

  const handleLogout = async () => {
    try {
      await signOut();
      dispatch(logout());
      toast.success("Logged out successfully");
      navigate("/login");
    } catch (error: any) {
      toast.error(`Logout failed: ${error.message}`);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link to="/" className="font-bold text-2xl text-primary">
            ExamFlowPro
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-6">
          {isAuthenticated && (
            <>
              {!isAdmin && (
                <>
                  <Link
                    to="/study"
                    className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                  >
                    Study Mode
                  </Link>
                  <Link
                    to="/exams"
                    className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                  >
                    Exams
                  </Link>
                </>
              )}
              {isAdmin && (
                <Link
                  to="/questions"
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  Question Banks
                </Link>
              )}
            </>
          )}
        </nav>

        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="rounded-full">
                  <User className="h-4 w-4" />
                  <span className="sr-only">User menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>
                  {user?.username || "My Account"}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="flex items-center cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                
                {!isAdmin && (
                  <>
                    <DropdownMenuItem asChild>
                      <Link to="/study" className="flex items-center cursor-pointer">
                        <Book className="mr-2 h-4 w-4" />
                        <span>Study Mode</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/exams" className="flex items-center cursor-pointer">
                        <TestTube className="mr-2 h-4 w-4" />
                        <span>Exams</span>
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
                
                {isAdmin && (
                  <DropdownMenuItem asChild>
                    <Link to="/questions" className="flex items-center cursor-pointer">
                      <HelpCircle className="mr-2 h-4 w-4" />
                      <span>Question Banks</span>
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" asChild>
                <Link to="/login">Login</Link>
              </Button>
              <Button asChild>
                <Link to="/register">Register</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
