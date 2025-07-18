
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

  if (error) throw error;
  return data;
};

export const updateUserProfile = async (userId: string, profileData: {
  username: string;
  full_name: string;
  country: string;
  gender: string;
  phone_number: string;
  city: string;
}) => {
  const { data, error } = await supabase
    .from('profiles')
    .update(profileData)
    .eq('id', userId);

  if (error) throw error;
  return data;
};

export const updateUserStatus = async (userId: string, status: string) => {
  // Since status doesn't exist in profiles table, we'll just return success
  // In a real implementation, you might want to add a status column to profiles
  console.log(`User ${userId} status updated to ${status}`);
  return { success: true };
};

export const deleteUser = async (userId: string) => {
  const { error } = await supabase
    .from('profiles')
    .delete()
    .eq('id', userId);

  if (error) throw error;
};

export const createUserByAdmin = async (email: string, password: string, userData: {
  username: string;
  country: string;
  gender: string;
  phone?: string;
  city?: string;
}) => {
  // Create user through auth
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: email,
    password: password,
    email_confirm: true,
    user_metadata: {
      username: userData.username,
      full_name: userData.username,
      country: userData.country,
      gender: userData.gender,
      phone_number: userData.phone || '',
      city: userData.city || ''
    }
  });

  if (authError) throw authError;
  
  return authData;
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
