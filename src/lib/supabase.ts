import { createClient } from '@supabase/supabase-js';

// Environment variables must be added to your .env.local file
// NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
// NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper function for file uploads
export const uploadFile = async (
  bucket: string,
  path: string,
  file: File
) => {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false
    });
  
  if (error) {
    throw error;
  }
  
  return data;
};

// Helper function to get a public URL for a file
export const getPublicUrl = (
  bucket: string,
  path: string
) => {
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(path);
    
  return data.publicUrl;
};

// Helper function to check database connection
export const checkDatabaseConnection = async () => {
  try {
    console.log('Checking database connection...');
    
    // First check if the Supabase client is properly initialized
    if (!supabase) {
      console.error('Supabase client is not initialized');
      return {
        connected: false,
        error: 'Supabase client is not initialized',
        details: 'The Supabase client object is undefined or null'
      };
    }
    
    // Log the Supabase URL (without the API key for security)
    console.log('Using Supabase URL:', supabaseUrl ? supabaseUrl.substring(0, 20) + '...' : 'URL is missing');
    
    // Try a simple auth check first (doesn't require database access)
    console.log('Testing auth API...');
    const authCheck = await supabase.auth.getSession();
    console.log('Auth API response:', authCheck.error ? 'Error' : 'Success');
    
    if (authCheck.error) {
      console.error('Auth API check failed:', authCheck.error);
      return {
        connected: false,
        error: `Auth API error: ${authCheck.error.message}`,
        code: authCheck.error.code,
        details: authCheck.error
      };
    }
    
    // Now try to query the database
    console.log('Testing database connection...');
    const { data, error } = await supabase
      .from('profiles')
      .select('count(*)', { count: 'exact', head: true });
    
    if (error) {
      console.error('Database connection check failed:', error);
      return {
        connected: false,
        error: error.message || 'Unknown database error',
        code: error.code,
        details: error
      };
    }
    
    console.log('Database connection successful:', data);
    return {
      connected: true,
      data
    };
  } catch (err) {
    console.error('Database connection check exception:', err);
    return {
      connected: false,
      error: err instanceof Error ? err.message : 'Unknown error',
      details: err
    };
  }
};