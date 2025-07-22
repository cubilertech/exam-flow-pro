
import { supabase } from '@/integrations/supabase/client';

export const signUp = async (userData: {
  email: string;
  password: string;
  username: string;
  full_name: string;
  country: string;
  gender: string;
  phone_number?: string;
  city?: string;
}) => {
  const { data, error } = await supabase.auth.signUp({
    email: userData.email,
    password: userData.password,
    options: {
      data: {
        username: userData.username,
        full_name: userData.full_name,
        country: userData.country,
        gender: userData.gender,
        phone_number: userData.phone_number || '',
        city: userData.city || ''
      }
    }
  });

  if (error) throw error;
  return data;
};

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) throw error;

  // Check user status after successful authentication
  if (data.user) {
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('status')
      .eq('id', data.user.id)
      .single();

    if (profileError) {
      console.error('Error fetching profile:', profileError);
      // Continue with login if profile fetch fails
    } else {
      if (profile?.status === 'blocked') {
        // Sign out immediately if user is blocked
        await supabase.auth.signOut();
        throw new Error('Your account has been blocked by the administrator. Please contact admin support for assistance.');
      }

      if (profile?.status === 'suspended') {
        // Sign out immediately if user is suspended
        await supabase.auth.signOut();
        throw new Error('Your account has been suspended by the administrator. Please contact admin support for assistance.');
      }
    }
  }

  return data;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return null;

  // Get user profile
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error) throw error;

  // Check if user is admin
  const { data: adminData } = await supabase
    .from('admin_users')
    .select('id')
    .eq('user_id', user.id)
    .single();

  return {
    id: user.id,
    email: user.email,
    username: profile.username,
    country: profile.country,
    gender: profile.gender,
    phone: profile.phone_number,
    city: profile.city,
    isAdmin: !!adminData
  };
};

export const getAllUsers = async () => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching users:', error);
    throw new Error('Failed to fetch users');
  }

  return data;
};

export const updateUserProfile = async (
  userId: string,
  profileData: {
    username: string;
    full_name: string;
    country: string;
    gender: string;
    phone_number: string;
    city: string;
  }
) => {
  const { data, error } = await supabase
    .from("profiles")
    .update(profileData)
    .eq("id", userId);

  if (error) throw error;
  return data;
};

export const updateUserStatus = async (userId: string, status: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .update({ status })
    .eq('id', userId);

  if (error) throw error;

  // If blocking a user, force sign out all their sessions
  if (status === 'blocked' || status === 'suspended') {
    try {
      // Create an edge function call to handle session termination
      await supabase.functions.invoke('terminate-user-sessions', {
        body: { userId }
      });
    } catch (funcError) {
      console.warn('Could not terminate user sessions:', funcError);
      // Don't throw error here as the status update was successful
    }
  }

  return data;
};

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
    const err = error as Error;
    console.error('Error checking admin status:', err);
    return false;
  }
};

export const deleteUser = async (userId: string) => {
  const { error } = await supabase
    .from('profiles')
    .delete()
    .eq('id', userId);

  if (error) throw error;
};

export const createUserByAdmin = async (
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
    
    if (authError) {
      console.error('Auth error during signup:', authError);
      throw authError;
    }
    
    if (!authData.user) {
      console.error('No user returned from auth');
      throw new Error('User registration failed');
    }
    
    console.log('User created successfully:', authData.user.id);
    
    // 2. Insert the user profile data
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: authData.user.id,
        username: userData.username,
        full_name: userData.username,
        country: userData.country,
        gender: userData.gender,
        phone_number: userData.phone,
        city: userData.city,
        status: 'active', // Set default status
      });
    
    if (profileError) {
      console.error('Profile creation error:', profileError);
      throw profileError;
    }
    
    console.log('Profile created successfully');
    
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
  } catch (error) {
    const err = error as Error;
    console.error('Sign up error:', err);
    throw error;
  }
};

export const createUser = async (userData: {
  email: string;
  password: string;
  username: string;
  full_name: string;
  country: string;
  gender: string;
  phone_number?: string;
  city?: string;
}) => {
  // Create user through auth
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: userData.email,
    password: userData.password,
    email_confirm: true,
    user_metadata: {
      username: userData.username,
      full_name: userData.full_name,
      country: userData.country,
      gender: userData.gender,
      phone_number: userData.phone_number || '',
      city: userData.city || ''
    }
  });

  if (authError) throw authError;
  
  return authData;
};
