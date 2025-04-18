
import { useEffect, useState } from 'react';
import { useAppDispatch } from '@/lib/hooks';
import { loginSuccess, logout } from '@/features/auth/authSlice';
import { supabase } from '@/integrations/supabase/client';

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const dispatch = useAppDispatch();
  const [isInitialized, setIsInitialized] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session ? 'Session exists' : 'No session');
        
        if (event === 'SIGNED_IN' && session) {
          const { user } = session;
          
          setTimeout(async () => {
            try {
              const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .maybeSingle();
                
              if (profileError) {
                console.error('Error fetching profile:', profileError);
              }
              
              const profile = profileData || { username: user.email?.split('@')[0] || 'user' };
              
              const { data: adminData } = await supabase
                .from('admin_users')
                .select('*')
                .eq('user_id', user.id)
                .maybeSingle();
              
              dispatch(loginSuccess({
                id: user.id,
                email: user.email || '',
                username: profile.username || '',
                country: 'country' in profile ? profile.country || '' : '',
                gender: 'gender' in profile ? profile.gender || '' : '',
                phone: 'phone_number' in profile ? profile.phone_number || '' : '',
                city: 'city' in profile ? profile.city || '' : '',
                isAdmin: !!adminData
              }));

              // Redirect based on role
              if (location.pathname === '/login' || location.pathname === '/register' || location.pathname === '/') {
                if (!!adminData) {
                  navigate('/questions');
                } else {
                  navigate('/my-exams');
                }
              }
            } catch (error) {
              console.error('Error processing auth state change:', error);
            }
          }, 0);
        } else if (event === 'SIGNED_OUT') {
          console.log('User signed out, dispatching logout');
          dispatch(logout());
        }
      }
    );
    
    // Then check for existing session
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          const { user } = session;
          
          // Fetch user profile data from profiles table
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .maybeSingle();
            
          if (profileError) {
            console.error('Error fetching profile on init:', profileError);
          }
          
          const profile = profileData || { username: user.email?.split('@')[0] || 'user' };
          
          // Check if the user is an admin
          const { data: adminData } = await supabase
            .from('admin_users')
            .select('*')
            .eq('user_id', user.id)
            .maybeSingle();
          
          console.log('Initial session found, dispatching login success');
          dispatch(loginSuccess({
            id: user.id,
            email: user.email || '',
            username: profile.username || '',
            country: 'country' in profile ? profile.country || '' : '',
            gender: 'gender' in profile ? profile.gender || '' : '',
            phone: 'phone_number' in profile ? profile.phone_number || '' : '',
            city: 'city' in profile ? profile.city || '' : '',
            isAdmin: !!adminData
          }));
        }
      } catch (error) {
        console.error('Error checking session:', error);
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
  }, [dispatch]);

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
