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
import { signIn } from '@/services/authService';
import { zodResolver } from '@hookform/resolvers/zod';

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export const LoginForm = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // const from = (location.state as any)?.from?.pathname || "/";

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      setLoading(true);
      setFormError(null);
      dispatch(loginStart());
      
      console.log("Attempting login with:", data.email);
      const userData = await signIn(data.email, data.password);
      
      if (userData) {
        dispatch(loginSuccess(userData));
        toast.success("Login successful!");
        // Use a small timeout to ensure state updates have propagated
        if (location.pathname === '/login' || location.pathname === '/register' || location.pathname === '/') {
          const redirectPath = userData?.isAdmin ? '/questions' : '/my-exams';
          navigate(redirectPath, { replace: true });
        }
        // setTimeout(() => {
        //   navigate(from, { replace: true });
        // }, 100);
      } else {
        throw new Error("No user data returned from login");
      }
    } catch (error) {
      const err =  error as Error;
      console.error("Login error:", err);
      const errorMessage = err.message || "Login failed. Please check your credentials.";
      dispatch(loginFailure(errorMessage));
      setFormError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Log in</CardTitle>
        <CardDescription>
          Enter your credentials to access your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {formError && (
              <div className="p-3 rounded-md bg-destructive/15 text-destructive text-sm mb-4">
                {formError}
              </div>
            )}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="email@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="********" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Logging in...
                </>
              ) : (
                "Login"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex flex-col gap-4">
        <div className="text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="text-primary underline-offset-4 hover:underline"
          >
            Register
          </Link>
        </div>
        <div className="text-xs text-muted-foreground italic">
          Note: This is a development environment. For testing, you need to register a new account first.
        </div>
      </CardFooter>
    </Card>
  );
};
