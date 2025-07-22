
import { useState } from 'react';

import { Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import {
  Link,
  useLocation,
  useNavigate,
} from 'react-router-dom';
import { toast } from 'sonner';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  loginFailure,
  loginStart,
  loginSuccess,
} from '@/features/auth/authSlice';
import { useAppDispatch } from '@/lib/hooks';
import { signIn, getCurrentUser } from '@/services/authService';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '../ui/alert';
import { Label } from 'recharts';
// import { Label } from 'recharts';

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();
  const dispatch = useAppDispatch();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    dispatch(loginStart());

    try {
      const data = await signIn(email, password);
      
      if (data.user) {
        toast({
          title: "Success",
          description: "Logged in successfully",
        });
        
        // The AuthProvider will handle the redirect
      }
    } catch (error: any) {
      console.error("Login error:", error);
      const errorMessage = error.message || "Login failed";
      
      // Check if it's a blocked/suspended user error
      if (errorMessage.includes("blocked") || errorMessage.includes("suspended")) {
        setError(errorMessage);
        toast({
          title: "Access Denied",
          description: errorMessage,
          variant: "destructive",
        });
      } else {
        setError("Invalid email or password");
        toast({
          title: "Error",
          description: "Invalid email or password",
          variant: "destructive",
        });
      }
      
      dispatch(loginFailure(errorMessage));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Sign In</CardTitle>
        <CardDescription>
          Enter your credentials to access your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-2">
            <FormLabel htmlFor="email">Email</FormLabel>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
            />
          </div>
          
          <div className="space-y-2">
            <FormLabel htmlFor="password">Password</FormLabel>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
            />
          </div>
          
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col gap-4">
        <div className="text-xs text-muted-foreground italic">
          Note: This is a development environment. For testing, you need to register a new account first.
        </div>
      </CardFooter>
    </Card>
  );
};
