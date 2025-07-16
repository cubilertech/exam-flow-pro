import { supabase } from '@/integrations/supabase/client';

export const getAllUsers = async () => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*');

  if (error) {
    throw error;
  }

  return data;
};

export const updateUserStatus = async (userId: string, status: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .update({ status })
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
};

export const deleteUser = async (userId: string) => {
  const { error } = await supabase
    .from('profiles')
    .delete()
    .eq('id', userId);

  if (error) {
    throw error;
  }
};

export const createUserByAdmin = async (email: string, password: string, profileData: {
  username: string;
  country: string;
  gender: string;
  phone: string;
  city: string;
}) => {
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: email,
    password: password,
  });

  if (authError) {
    throw authError;
  }

  if (authData.user?.id) {
    const { data: profileDataResult, error: profileError } = await supabase
      .from('profiles')
      .insert([
        {
          id: authData.user.id,
          username: profileData.username,
          country: profileData.country,
          gender: profileData.gender,
          phone_number: profileData.phone,
          city: profileData.city,
          email: email,
        },
      ])
      .select()

    if (profileError) {
      throw profileError;
    }

    return { authData, profileDataResult };
  }
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
    .update({
      username: profileData.username,
      full_name: profileData.full_name,
      country: profileData.country,
      gender: profileData.gender,
      phone_number: profileData.phone_number,
      city: profileData.city,
    })
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
};
