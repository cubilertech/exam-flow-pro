import * as React from 'react';

import {
  Book,
  LogOut,
  User,
} from 'lucide-react';
import {
  Link,
  useNavigate,
} from 'react-router-dom';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { logout } from '@/features/auth/authSlice';
import {
  useQuestionBankSubscriptions,
} from '@/hooks/useQuestionBankSubscriptions';
import { supabase } from '@/integrations/supabase/client';
import {
  useAppDispatch,
  useAppSelector,
} from '@/lib/hooks';

export const Navbar = () => {
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { subscriptions, activeQuestionBankId, setActiveQuestionBankById } = useQuestionBankSubscriptions();

  const handleLogout = async () => {
    try {
      // Call Supabase's signOut method directly, don't use the service function
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }
      
      // Dispatch logout action to update Redux state
      dispatch(logout());
      toast.success("Logged out successfully");
      navigate("/login");
    } catch (error: any) {
      console.error("Logout error:", error);
      toast.error(`Logout failed: ${error.message}`);
    }
  };

  const handleQuestionBankChange = (questionBankId: string) => {
    setActiveQuestionBankById(questionBankId);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link to="/" className="font-bold text-2xl text-primary">
            ExamFlowPro
          </Link>
        </div>

        <div className="flex-1 flex items-center justify-center">
        {isAuthenticated && (
          <>
            <p className="text-lg text-muted-foreground pr-3">Questions Bank</p>
            <div className="max-w-xs w-full">
              <Select
                value={activeQuestionBankId || undefined}
                onValueChange={(value) => {
                  if (value === "manage") {
                    navigate('/profile');
                  } else {
                    handleQuestionBankChange(value);
                  }
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Question Bank">
                    {activeQuestionBankId ? 
                      subscriptions.find(qb => qb.id === activeQuestionBankId)?.name || "Select Question Bank" 
                      : "Select Question Bank"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {subscriptions.map((qb) => (
                    <SelectItem key={qb.id} value={qb.id}>
                      <div className="flex items-center">
                        <Book className="mr-2 h-4 w-4" />
                        <span>{qb.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                  <SelectItem value="manage">
                    <div className="flex items-center">
                      <Book className="mr-2 h-4 w-4" />
                      <span>Manage subscriptions</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
          )}
        </div>

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
};

