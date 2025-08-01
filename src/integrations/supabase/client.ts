// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';

import type { Database } from './types';

const SUPABASE_URL = "https://ugohngawkzymjvuwjqyp.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVnb2huZ2F3a3p5bWp2dXdqcXlwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ3OTc4MjIsImV4cCI6MjA2MDM3MzgyMn0.jyue1Jl21KvYQj_fz1CzchZSJFO5yDvFya27kwGbk6E";
const SUPABASE_SERVICE_ROLE_KEY = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

// Initialize the Supabase client
export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
export const supabaseAdmin = createClient<Database>(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
// Initialize storage bucket for question images if it doesn't exist
const createStorageBucket = async () => {
  try {
    // First check if the bucket already exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('Error checking buckets:', listError);
      return;
    }
    
    const bucketExists = buckets.some(b => b.name === 'question_images');
    // if (!bucketExists) {
    //   const { data, error } = await supabase.storage.createBucket('question_images', {
    //     public: true,
    //     fileSizeLimit: 2097152, // 2MB
    //   });
      
    //   if (error) {
    //     console.error('Error creating storage bucket:', error);
    //   } else {
    //     console.log('Storage bucket created successfully:', data);
    //   }
    // }
  } catch (error) {
    console.error('Error initializing storage bucket:', error);
  }
};

// Run this once when the client initializes
// createStorageBucket();
