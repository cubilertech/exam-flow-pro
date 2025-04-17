
import { useEffect } from 'react';
import { useAppDispatch } from '@/lib/hooks';
import { loginSuccess, logout } from '@/features/auth/authSlice';
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
    };
    
    // Initialize auth
    initializeAuth();

    // Set up auth state listener
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session ? 'Session exists' : 'No session');
        
        if (event === 'SIGNED_IN' && session) {
          const { user } = session;
          
          // Fetch user profile data
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
        } else if (event === 'SIGNED_OUT') {
          dispatch(logout());
        }
      }
    );
    
    return () => {
      if (authListener) {
        authListener.subscription.unsubscribe();
      }
    };
  }, [dispatch]);

  return <>{children}</>;
};
