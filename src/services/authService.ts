
import { supabase } from '@/integrations/supabase/client';
import { User } from '@/features/auth/authSlice';

// Check if a user is an admin
export const checkIsAdmin = async (userId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .rpc('is_admin', { user_id: userId });
    
    if (error) throw error;
    return data || false;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
};

// Get user profile data
export const fetchUserProfile = async (userId: string): Promise<Partial<User> | null> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('username, country, gender, phone_number, city')
      .eq('id', userId)
      .single();
    
    if (error) throw error;
    
    return data ? {
      username: data.username || '',
      country: data.country || '',
      gender: data.gender || '',
      phone: data.phone_number || '',
      city: data.city || '',
    } : null;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
};

// Sign up a new user
export const signUp = async (
  email: string,
  password: string,
  userData: {
    username: string;
    country: string;
    gender: string;
    phone?: string;
    city?: string;
  }
) => {
  try {
    // 1. Create the auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: userData.username,
          full_name: userData.username,
        },
      },
    });
    
    if (authError) throw authError;
    if (!authData.user) throw new Error('User registration failed');
    
    // 2. Insert the user profile data
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        username: userData.username,
        country: userData.country,
        gender: userData.gender,
        phone_number: userData.phone,
        city: userData.city,
      })
      .eq('id', authData.user.id);
    
    if (profileError) throw profileError;
    
    // 3. Check if the user is an admin
    const isAdmin = await checkIsAdmin(authData.user.id);
    
    // Return user data
    return {
      id: authData.user.id,
      email: authData.user.email || '',
      username: userData.username,
      country: userData.country,
      gender: userData.gender,
      phone: userData.phone,
      city: userData.city,
      isAdmin,
    };
  } catch (error: any) {
    throw error;
  }
};

// Sign in an existing user
export const signIn = async (email: string, password: string) => {
  try {
    // 1. Sign in with email and password
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (authError) throw authError;
    if (!authData.user) throw new Error('Login failed');
    
    // 2. Fetch user profile data
    const profileData = await fetchUserProfile(authData.user.id);
    
    // 3. Check if the user is an admin
    const isAdmin = await checkIsAdmin(authData.user.id);
    
    // Return combined user data
    return {
      id: authData.user.id,
      email: authData.user.email || '',
      username: profileData?.username || '',
      country: profileData?.country || '',
      gender: profileData?.gender || '',
      phone: profileData?.phone || '',
      city: profileData?.city || '',
      isAdmin,
    };
  } catch (error: any) {
    throw error;
  }
};

// Sign out the current user
export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

// Set up auth state listener
export const setupAuthListener = (callback: (user: User | null) => void) => {
  return supabase.auth.onAuthStateChange(async (event, session) => {
    if (event === 'SIGNED_IN' && session?.user) {
      try {
        const profileData = await fetchUserProfile(session.user.id);
        const isAdmin = await checkIsAdmin(session.user.id);
        
        const userData: User = {
          id: session.user.id,
          email: session.user.email || '',
          username: profileData?.username || '',
          country: profileData?.country || '',
          gender: profileData?.gender || '',
          phone: profileData?.phone || '',
          city: profileData?.city || '',
          isAdmin,
        };
        
        callback(userData);
      } catch (error) {
        console.error('Error setting up auth listener:', error);
        callback(null);
      }
    } else if (event === 'SIGNED_OUT') {
      callback(null);
    }
  });
};
