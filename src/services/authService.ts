
import { User } from '@/features/auth/authSlice';
import { supabase } from '@/integrations/supabase/client';

interface UserProfile {
  username: string;
  country?: string;
  gender?: string;
  phone_number?: string;
  city?: string;
  status?: 'active' | 'blocked' | 'suspended';
}

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
    const err = error as Error;
    console.error('Error checking admin status:', err);
    return false;
  }
};

// Get user profile data
export const fetchUserProfile = async (userId: string): Promise<Partial<User> | null> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('username, country, gender, phone_number, city, status')
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
      status: data.status || 'active',
    } : null;
  } catch (error) {
    const err = error as Error;
    console.error('Error fetching user profile:', err);
    return null;
  }
};

// Admin creates a new user
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
      console.error('Auth error during user creation:', authError);
      throw authError;
    }
    
    if (!authData.user) {
      console.error('No user returned from auth');
      throw new Error('User creation failed');
    }
    
    console.log('User created successfully by admin:', authData.user.id);
    
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
        status: 'active',
      });
    
    if (profileError) {
      console.error('Profile creation error:', profileError);
      throw profileError;
    }
    
    console.log('Profile created successfully');
    
    // 3. Log the admin action
    await logAdminAction('create_user', authData.user.id, null, {
      email,
      username: userData.username,
      country: userData.country,
      gender: userData.gender,
      phone: userData.phone,
      city: userData.city,
    });
    
    return {
      id: authData.user.id,
      email: authData.user.email || '',
      username: userData.username,
      country: userData.country,
      gender: userData.gender,
      phone: userData.phone,
      city: userData.city,
      isAdmin: false,
      status: 'active' as const,
    };
  } catch (error) {
    const err = error as Error;
    console.error('Create user error:', err);
    throw error;
  }
};

// Update user status (block/unblock)
export const updateUserStatus = async (userId: string, newStatus: 'active' | 'blocked' | 'suspended') => {
  try {
    // Get current user data for audit log
    const { data: currentUser, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (fetchError) {
      console.error('Error fetching current user:', fetchError);
      throw fetchError;
    }
    
    // Update user status
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ status: newStatus })
      .eq('id', userId);
    
    if (updateError) {
      console.error('Error updating user status:', updateError);
      throw updateError;
    }
    
    // Log the admin action
    await logAdminAction('update_status', userId, 
      { status: currentUser.status }, 
      { status: newStatus }
    );
    
    console.log(`User ${userId} status updated to ${newStatus}`);
    return true;
  } catch (error) {
    const err = error as Error;
    console.error('Update user status error:', err);
    throw error;
  }
};

// Get all users (admin only)
export const getAllUsers = async () => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching all users:', error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    const err = error as Error;
    console.error('Get all users error:', err);
    throw error;
  }
};

// Update user profile (admin only)
export const updateUserProfile = async (userId: string, updates: Partial<UserProfile>) => {
  try {
    // Get current user data for audit log
    const { data: currentUser, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (fetchError) {
      console.error('Error fetching current user:', fetchError);
      throw fetchError;
    }
    
    // Update user profile
    const { error: updateError } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId);
    
    if (updateError) {
      console.error('Error updating user profile:', updateError);
      throw updateError;
    }
    
    // Log the admin action
    await logAdminAction('update_profile', userId, 
      currentUser, 
      updates
    );
    
    console.log(`User ${userId} profile updated`);
    return true;
  } catch (error) {
    const err = error as Error;
    console.error('Update user profile error:', err);
    throw error;
  }
};

// Delete user (admin only)
export const deleteUser = async (userId: string) => {
  try {
    // Get current user data for audit log
    const { data: currentUser, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (fetchError) {
      console.error('Error fetching current user:', fetchError);
      throw fetchError;
    }
    
    // Delete user from auth (this will cascade to profiles due to foreign key)
    const { error: deleteError } = await supabase.auth.admin.deleteUser(userId);
    
    if (deleteError) {
      console.error('Error deleting user:', deleteError);
      throw deleteError;
    }
    
    // Log the admin action
    await logAdminAction('delete_user', userId, currentUser, null);
    
    console.log(`User ${userId} deleted`);
    return true;
  } catch (error) {
    const err = error as Error;
    console.error('Delete user error:', err);
    throw error;
  }
};

// Log admin actions for audit trail
const logAdminAction = async (
  action: string,
  targetUserId: string,
  oldValues: any,
  newValues: any
) => {
  try {
    const { error } = await supabase
      .from('user_audit_log')
      .insert({
        admin_user_id: (await supabase.auth.getUser()).data.user?.id,
        target_user_id: targetUserId,
        action,
        old_values: oldValues,
        new_values: newValues,
      });
    
    if (error) {
      console.error('Error logging admin action:', error);
    }
  } catch (error) {
    console.error('Error logging admin action:', error);
  }
};

// Sign in an existing user (only active users can sign in)
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
    
    // 2. Fetch user profile data with status check
    let profile: UserProfile & { status?: string } = { username: email.split('@')[0] };
    
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .maybeSingle();
        
      if (!profileError && profileData) {
        profile = profileData;
        
        // Check if user is blocked or suspended
        if (profile.status === 'blocked' || profile.status === 'suspended') {
          await supabase.auth.signOut();
          throw new Error(`Account is ${profile.status}. Please contact administrator.`);
        }
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
              status: 'active',
            });
            
          if (upsertError) {
            console.error('Error creating profile:', upsertError);
          }
        }
      }
    } catch (error) {
      const err = error as Error;
      console.error('Error fetching profile:', err);
    }
    
    // 3. Check if the user is an admin
    let isAdmin = false;
    try {
      isAdmin = await checkIsAdmin(authData.user.id);
    } catch (error) {
      const err = error as Error;
      console.error('Error checking admin status:', err);
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
      status: profile.status || 'active',
      isAdmin,
    };
  } catch (error) {
    const err = error as Error;
    console.error('Sign in error:', err);
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
    const err = error as Error;
    console.error('Sign out error:', err);
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
        
        // Check if user is blocked or suspended
        if (profileData?.status === 'blocked' || profileData?.status === 'suspended') {
          await supabase.auth.signOut();
          callback(null);
          return;
        }
        
        const isAdmin = await checkIsAdmin(session.user.id);
        
        const userData: User = {
          id: session.user.id,
          email: session.user.email || '',
          username: profileData?.username || '',
          country: profileData?.country || '',
          gender: profileData?.gender || '',
          phone: profileData?.phone || '',
          city: profileData?.city || '',
          status: profileData?.status || 'active',
          isAdmin,
        };
        
        callback(userData);
      } catch (error) {
        const err = error as Error;
        console.error('Error setting up auth listener:', err);
        callback(null);
      }
    } else if (event === 'SIGNED_OUT') {
      callback(null);
    }
  });
};
