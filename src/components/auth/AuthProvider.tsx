
import { useEffect } from 'react';
import { useAppDispatch } from '@/lib/hooks';
import { loginSuccess, logout } from '@/features/auth/authSlice';
import { setupAuthListener } from '@/services/authService';
import { supabase } from '@/integrations/supabase/client';

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Check for existing session on initial load
    const initializeAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        const { user } = session;
        
        // Fetch user profile data from profiles table
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
          
        if (!profileError && profileData) {
          // Check if the user is an admin
          const { data: adminData } = await supabase
            .from('admin_users')
            .select('*')
            .eq('user_id', user.id)
            .single();
          
          dispatch(loginSuccess({
            id: user.id,
            email: user.email || '',
            username: profileData.username || '',
            country: profileData.country || '',
            gender: profileData.gender || '',
            phone: profileData.phone_number,
            city: profileData.city,
            isAdmin: !!adminData
          }));
        }
      }
      
      // Set up auth state listener
      const { data: authListenerData } = setupAuthListener(async (authUser) => {
        if (authUser) {
          // Fetch user profile data
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', authUser.id)
            .single();
            
          if (!profileError && profileData) {
            // Check if the user is an admin
            const { data: adminData } = await supabase
              .from('admin_users')
              .select('*')
              .eq('user_id', authUser.id)
              .single();
            
            dispatch(loginSuccess({
              id: authUser.id,
              email: authUser.email || '',
              username: profileData.username || '',
              country: profileData.country || '',
              gender: profileData.gender || '',
              phone: profileData.phone_number,
              city: profileData.city,
              isAdmin: !!adminData
            }));
          }
        } else {
          dispatch(logout());
        }
      });
      
      return () => {
        if (authListenerData?.subscription) {
          authListenerData.subscription.unsubscribe();
        }
      };
    };
    
    initializeAuth();
  }, [dispatch]);

  return <>{children}</>;
};
