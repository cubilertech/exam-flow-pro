
import { useEffect } from 'react';
import { useAppDispatch } from '@/lib/hooks';
import { loginSuccess, logout } from '@/features/auth/authSlice';
import { setupAuthListener } from '@/services/authService';
import { supabase } from '@/integrations/supabase/client';

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Check for existing session on initial load
    const initializeAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) return;
      
      // Set up auth state listener 
      const unsubscribe = setupAuthListener((user) => {
        if (user) {
          dispatch(loginSuccess(user));
        } else {
          dispatch(logout());
        }
      });
      
      return () => {
        unsubscribe.data.subscription.unsubscribe();
      };
    };
    
    initializeAuth();
  }, [dispatch]);

  return <>{children}</>;
};
