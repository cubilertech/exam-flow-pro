import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAppDispatch } from "@/lib/hooks";
import { loginSuccess, logout } from "@/features/auth/authSlice";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const dispatch = useAppDispatch();
  const [isInitialized, setIsInitialized] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log(
          "Auth state changed:",
          event,
          session ? "Session exists" : "No session",
        );

        if (event === "SIGNED_IN" && session) {
          const { user } = session;

          setTimeout(async () => {
            try {
              const { data: profileData, error: profileError } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", user.id)
                .maybeSingle();

              if (profileError) {
                console.error("Error fetching profile:", profileError);
              }

              const profile = profileData || {
                username: user.email?.split("@")[0] || "user",
              };

              // Check if user is blocked or suspended
              const userStatus = (profile as any)?.status || "active";
              if (userStatus === "blocked") {
                console.log("User is blocked, signing out");
                await supabase.auth.signOut();
                dispatch(logout());
                toast({
                  title: "Account Blocked",
                  description:
                    "Your account has been blocked by the administrator. Please contact admin support for assistance.",
                  variant: "destructive",
                });
                navigate("/login");
                return;
              }

              if (userStatus === "suspended") {
                console.log("User is suspended, signing out");
                await supabase.auth.signOut();
                dispatch(logout());
                toast({
                  title: "Account Suspended",
                  description:
                    "Your account has been suspended by the administrator. Please contact admin support for assistance.",
                  variant: "destructive",
                });
                navigate("/login");
                return;
              }

              const { data: adminData } = await supabase
                .from("admin_users")
                .select("*")
                .eq("user_id", user.id)
                .maybeSingle();

              dispatch(
                loginSuccess({
                  id: user.id,
                  email: user.email || "",
                  username: (profile as any)?.username || "",
                  country: (profile as any)?.country || "",
                  gender: (profile as any)?.gender || "",
                  phone: (profile as any)?.phone_number || "",
                  city: (profile as any)?.city || "",
                  status: userStatus as "active" | "blocked" | "suspended",
                  isAdmin: Boolean(adminData),
                }),
              );

              // Redirect based on role
              if (
                location.pathname === "/login" ||
                location.pathname === "/register" ||
                location.pathname === "/"
              ) {
                // if (adminData) {
                //   navigate("/questions");
                // } else {
                //   navigate("/");
                // }
                navigate("/");
              }
            } catch (error) {
              console.error("Error processing auth state change:", error);
            }
          }, 0);
        } else if (event === "SIGNED_OUT") {
          console.log("User signed out, dispatching logout");
          dispatch(logout());
        }
      },
    );

    // Then check for existing session
    const checkSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session) {
          const { user } = session;

          // Fetch user profile data from profiles table
          const { data: profileData, error: profileError } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .maybeSingle();

          if (profileError) {
            console.error("Error fetching profile on init:", profileError);
          }

          const profile = profileData || {
            username: user.email?.split("@")[0] || "user",
          };

          // Check if user is blocked or suspended
          const userStatus = (profile as any)?.status || "active";
          if (userStatus === "blocked") {
            console.log("User is blocked during init, signing out");
            await supabase.auth.signOut();
            dispatch(logout());
            toast({
              title: "Account Blocked",
              description:
                "Your account has been blocked by the administrator. Please contact admin support for assistance.",
              variant: "destructive",
            });
            navigate("/login");
            return;
          }

          if (userStatus === "suspended") {
            console.log("User is suspended during init, signing out");
            await supabase.auth.signOut();
            dispatch(logout());
            toast({
              title: "Account Suspended",
              description:
                "Your account has been suspended by the administrator. Please contact admin support for assistance.",
              variant: "destructive",
            });
            navigate("/login");
            return;
          }

          // Check if the user is an admin
          const { data: adminData } = await supabase
            .from("admin_users")
            .select("*")
            .eq("user_id", user.id)
            .maybeSingle();

          console.log("Initial session found, dispatching login success");
          dispatch(
            loginSuccess({
              id: user.id,
              email: user.email || "",
              username: (profile as any)?.username || "",
              country: (profile as any)?.country || "",
              gender: (profile as any)?.gender || "",
              phone: (profile as any)?.phone_number || "",
              city: (profile as any)?.city || "",
              status: userStatus as "active" | "blocked" | "suspended",
              isAdmin: Boolean(adminData),
            }),
          );
        }
      } catch (error) {
        console.error("Error checking session:", error);
      } finally {
        setIsInitialized(true);
      }
    };

    checkSession();

    return () => {
      if (authListener) {
        authListener.subscription.unsubscribe();
      }
    };
  }, [dispatch, navigate, location, toast]);

  // Return a loading indicator if auth is not initialized yet
  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return <>{children}</>;
};
