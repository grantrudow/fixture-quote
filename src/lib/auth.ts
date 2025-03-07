import { supabase } from './supabase';
import { User } from '@supabase/supabase-js';

/**
 * Check if the profiles table exists and create it if it doesn't
 * This is a helper function to ensure the database is properly set up
 */
async function ensureProfilesTable() {
  try {
    // First, try to query the profiles table to see if it exists
    const { error } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);
    
    // If there's no error, the table exists
    if (!error) {
      return true;
    }
    
    console.error('Error checking profiles table:', error);
    
    // If the error indicates the table doesn't exist, we can't create it from the client
    // This would require server-side code or manual setup in the Supabase dashboard
    return false;
  } catch (err) {
    console.error('Failed to check profiles table:', err);
    return false;
  }
}

/**
 * Sign up a new user with email and password
 */
export async function signUp(email: string, password: string, firstName: string, lastName: string, company?: string) {
  // Check if the profiles table exists
  await ensureProfilesTable();
  
  // Create the user in Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (authError) {
    throw authError;
  }

  // If the user was created successfully, create their profile
  if (authData.user) {
    try {
      // First attempt: Try to create the profile with all fields
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          email,
          first_name: firstName,
          last_name: lastName,
          company: company || null,
        });

      if (profileError) {
        console.error('Failed to create user profile:', profileError.message, profileError);
        console.error('Profile error details:', JSON.stringify(profileError, null, 2));
        console.error('Attempted to create profile with:', {
          id: authData.user.id,
          email,
          first_name: firstName,
          last_name: lastName,
          company: company || null,
        });
        
        // Second attempt: Try with minimal fields
        console.log('Attempting to create profile with minimal fields...');
        const { error: retryError } = await supabase
          .from('profiles')
          .insert({
            id: authData.user.id,
            email,
            first_name: firstName || '',
            last_name: lastName || '',
          });
          
        if (retryError) {
          console.error('Retry failed:', retryError.message);
          console.error('Retry error details:', JSON.stringify(retryError, null, 2));
          
          // Third attempt: Try with only required fields
          console.log('Attempting to create profile with only required fields...');
          const { error: lastAttemptError } = await supabase
            .from('profiles')
            .insert({
              id: authData.user.id,
              email,
            });
            
          if (lastAttemptError) {
            console.error('Final attempt failed:', lastAttemptError.message);
            console.error('Final attempt error details:', JSON.stringify(lastAttemptError, null, 2));
            
            // Run diagnostics to help troubleshoot
            const diagnostics = await diagnoseProfilesTable();
            console.error('Profile table diagnostics:', diagnostics);
            
            throw new Error(`Profile creation failed: ${profileError.message}. Please contact support.`);
          } else {
            console.log('Profile created with only required fields after previous failures');
            // Success on last attempt, continue with the flow
          }
        } else {
          console.log('Profile created with minimal fields after initial failure');
          // Success on retry, continue with the flow
        }
      }
    } catch (err) {
      console.error('Profile creation exception:', err);
      throw new Error(`Unable to complete signup. Please try again later or contact support. (Error: ${err instanceof Error ? err.message : 'Unknown error'})`);
    }
  }

  return authData;
}

/**
 * Sign in a user with email and password
 */
export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw error;
  }

  return data;
}

/**
 * Sign out the current user
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  
  if (error) {
    throw error;
  }
}

/**
 * Get the current user
 */
export async function getCurrentUser(): Promise<User | null> {
  const { data } = await supabase.auth.getUser();
  return data.user;
}

/**
 * Get the current user's profile
 */
export async function getUserProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    throw error;
  }

  return data;
}

/**
 * Update the current user's profile
 */
export async function updateUserProfile(userId: string, updates: {
  first_name?: string;
  last_name?: string;
  company?: string;
}) {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

/**
 * Reset password
 */
export async function resetPassword(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });

  if (error) {
    throw error;
  }
}

/**
 * Update password
 */
export async function updatePassword(newPassword: string) {
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    throw error;
  }
}

/**
 * Check if a profile exists for a user and create one if it doesn't
 * This can be used to fix orphaned auth users
 */
export async function ensureUserProfile(userId: string, email: string, firstName: string = '', lastName: string = '', company: string = '') {
  // First check if a profile already exists
  const { data: existingProfile, error: fetchError } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', userId)
    .single();

  if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 is "no rows returned" error
    console.error('Error checking for existing profile:', fetchError);
    throw fetchError;
  }

  // If profile doesn't exist, create it
  if (!existingProfile) {
    const { error: createError } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        email,
        first_name: firstName,
        last_name: lastName,
        company: company || null,
      });

    if (createError) {
      console.error('Error creating profile for orphaned auth user:', createError);
      throw createError;
    }

    console.log('Created profile for orphaned auth user:', userId);
  }

  return true;
}

/**
 * Diagnose common issues with the profiles table
 * This function can be used to troubleshoot database problems
 */
export async function diagnoseProfilesTable() {
  const results = {
    tableExists: false,
    canQuery: false,
    canInsert: false,
    requiredColumns: false,
    errors: [] as string[]
  };
  
  try {
    // Check if we can query the table
    const { error: queryError } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);
    
    if (queryError) {
      results.errors.push(`Query error: ${queryError.message}`);
      if (queryError.code === '42P01') {
        results.errors.push('The profiles table does not exist in the database.');
      }
    } else {
      results.tableExists = true;
      results.canQuery = true;
    }
    
    // If table exists, check if it has the required columns
    if (results.tableExists) {
      try {
        // Try to get column information by selecting with column names
        const { error: columnsError } = await supabase
          .from('profiles')
          .select('id, email, first_name, last_name, company')
          .limit(1);
        
        if (columnsError) {
          results.errors.push(`Column check error: ${columnsError.message}`);
          if (columnsError.code === '42703') {
            results.errors.push('The profiles table is missing one or more required columns.');
          }
        } else {
          results.requiredColumns = true;
        }
      } catch (err) {
        results.errors.push(`Column check exception: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
      
      // Try to insert a test record (will be rolled back)
      try {
        // Start a transaction that we'll roll back
        const { error: insertError } = await supabase.rpc('test_profile_insert', {
          test_id: 'test-' + Date.now(),
          test_email: 'test@example.com',
          test_first_name: 'Test',
          test_last_name: 'User'
        });
        
        if (insertError) {
          results.errors.push(`Insert test error: ${insertError.message}`);
        } else {
          results.canInsert = true;
        }
      } catch (err) {
        results.errors.push(`Insert test exception: ${err instanceof Error ? err.message : 'Unknown error'}`);
        results.errors.push('Note: The test_profile_insert function may not be defined in your database.');
      }
    }
  } catch (err) {
    results.errors.push(`General diagnosis error: ${err instanceof Error ? err.message : 'Unknown error'}`);
  }
  
  return results;
}