import { supabase } from '@/integrations/supabase/client';
import { User } from '@/features/auth/authSlice';

// Check if a user is an admin
export const checkIsAdmin = async (userId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('admin_users')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
    
    return !!data;
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
      .maybeSingle();
    
    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
    
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

// Check if username already exists
export const checkUsernameExists = async (username: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('username')
      .eq('username', username)
      .maybeSingle();
    
    if (error) {
      console.error('Error checking username:', error);
      throw error;
    }
    
    return !!data;
  } catch (error) {
    console.error('Error checking username:', error);
    throw error;
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
    // 1. Check if username already exists
    const usernameExists = await checkUsernameExists(userData.username);
    if (usernameExists) {
      throw new Error('Username already exists. Please choose a different username.');
    }
    
    // 2. Create the auth user
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
    
    if (authError) {
      console.error('Auth error during signup:', authError);
      throw authError;
    }
    
    if (!authData.user) {
      console.error('No user returned from auth');
      throw new Error('User registration failed');
    }
    
    console.log('User created successfully:', authData.user.id);
    
    // 3. Insert the user profile data - Log the data we're trying to insert
    console.log('Inserting profile data:', {
      id: authData.user.id,
      username: userData.username,
      country: userData.country,
      gender: userData.gender,
      phone_number: userData.phone,
      city: userData.city,
    });
    
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: authData.user.id,
        username: userData.username,
        country: userData.country,
        gender: userData.gender,
        phone_number: userData.phone,
        city: userData.city,
      }, {
        onConflict: 'id'
      });
    
    if (profileError) {
      console.error('Profile creation error:', profileError);
      throw profileError;
    }
    
    console.log('Profile created successfully');
    
    // 4. Check if the user is an admin
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
    console.error('Sign up error:', error);
    throw error;
  }
};

// Sign in an existing user
export const signIn = async (email: string, password: string) => {
  try {
    console.log('Signing in user:', email);
    
    // 1. Sign in with email and password
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (authError) {
      console.error('Auth error:', authError);
      throw authError;
    }
    
    if (!authData.user) {
      console.error('No user returned from auth');
      throw new Error('Login failed');
    }
    
    console.log('User authenticated successfully:', authData.user.id);
    
    // 2. Fetch user profile data with additional error handling
    let profile: any = { username: email.split('@')[0] };
    
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .maybeSingle();
        
      if (!profileError && profileData) {
        profile = profileData;
      } else if (profileError) {
        console.error('Profile error:', profileError);
        // If profile doesn't exist, create a basic one
        if (profileError.code === 'PGRST116') {
          console.log('Creating basic profile for user');
          const { error: upsertError } = await supabase
            .from('profiles')
            .upsert({
              id: authData.user.id,
              username: email.split('@')[0],
            });
            
          if (upsertError) {
            console.error('Error creating profile:', upsertError);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
    
    // 3. Check if the user is an admin
    let isAdmin = false;
    try {
      isAdmin = await checkIsAdmin(authData.user.id);
    } catch (error) {
      console.error('Error checking admin status:', error);
    }
    
    console.log('Login process completed successfully');
    
    // Return combined user data, safely accessing properties
    return {
      id: authData.user.id,
      email: authData.user.email || '',
      username: profile.username || '',
      country: profile.country || '',
      gender: profile.gender || '',
      phone: profile.phone_number || '',
      city: profile.city || '',
      isAdmin,
    };
  } catch (error: any) {
    console.error('Sign in error:', error);
    throw error;
  }
};

// Sign out the current user
export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Sign out error:', error);
      throw error;
    }
    console.log('User signed out successfully');
  } catch (error) {
    console.error('Sign out error:', error);
    throw error;
  }
};

// Set up auth state listener
export const setupAuthListener = (callback: (user: User | null) => void) => {
  return supabase.auth.onAuthStateChange(async (event, session) => {
    console.log('Auth state changed in service:', event);
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
