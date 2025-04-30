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

// Check if email already exists
export const checkEmailExists = async (email: string): Promise<boolean> => {
  try {
    // The previous approach using admin.listUsers with filter property is not supported
    // Let's use a different approach by checking if signing in with this email returns a specific error
    
    // Try to get user by email using auth.signInWithOtp without actually sending an OTP
    // This will tell us if the email is registered without attempting to authenticate
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: false, // Don't create a new user
      }
    });
    
    // If there's no error or the error isn't about a non-existent user, the email exists
    if (!error) {
      return true;
    }
    
    // Check error message to determine if the user doesn't exist
    if (error.message.includes("Email not confirmed") || 
        error.message.includes("User already registered")) {
      return true; // Email exists
    }
    
    if (error.message.includes("User not found") || 
        error.message.includes("Invalid login credentials")) {
      return false; // Email doesn't exist
    }
    
    console.error('Error checking email:', error);
    
    // Alternative approach: try to sign in with a fake password to see if the account exists
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password: 'checkingIfEmailExists123!',  // Fake password
    });
    
    // If the error message indicates invalid login credentials, the email exists
    // but password is wrong (which means email exists)
    if (signInError && signInError.message.includes('Invalid login credentials')) {
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error checking email:', error);
    return false;
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
    
    // 2. Check if email already exists
    const emailExists = await checkEmailExists(email);
    if (emailExists) {
      throw new Error('Email address is already registered. Please use a different email or try logging in.');
    }
    
    // 3. Create the auth user
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
    
    // 4. Insert the user profile data - Log the data we're trying to insert
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
    
    // 5. Check if the user is an admin
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
