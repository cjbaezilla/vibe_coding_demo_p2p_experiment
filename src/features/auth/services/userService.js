/**
 * User service to handle synchronization between Clerk and Supabase
 * This service handles creating and updating user records in Supabase
 * while Clerk remains the authentication provider
 */
import { supabase, supabaseAdmin } from '../../../supabaseClient';
import { v4 as uuidv4 } from 'uuid';

/**
 * Syncs a Clerk user with Supabase
 * @param {object} clerkUser - The Clerk user object
 * @returns {Promise<object>} - The Supabase user record
 */
export const syncUserWithSupabase = async (clerkUser) => {
  if (!clerkUser) {
    throw new Error('No Clerk user provided');
  }

  // Use admin client for write operations to bypass RLS
  if (!supabaseAdmin) {
    throw new Error('Supabase admin client not available. Check your service role key.');
  }

  try {
    // Check if user already exists in Supabase
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('clerk_id', clerkUser.id)
      .maybeSingle();

    // Handle fetch errors more gracefully
    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error fetching user:', fetchError);
      // Don't throw, proceed to create/update to attempt recovery
    }

    const userData = {
      clerk_id: clerkUser.id,
      email: clerkUser.primaryEmailAddress?.emailAddress,
      first_name: clerkUser.firstName,
      last_name: clerkUser.lastName,
      full_name: clerkUser.fullName,
      image_url: clerkUser.imageUrl,
      updated_at: new Date().toISOString()
    };

    if (existingUser) {
      // Update existing user
      const { data, error: updateError } = await supabaseAdmin
        .from('users')
        .update(userData)
        .eq('clerk_id', clerkUser.id)
        .select()
        .maybeSingle();

      if (updateError) {
        console.error('Error updating user:', updateError);
        throw updateError;
      }

      return data;
    } else {
      // Create new user with UUID
      const { data, error: insertError } = await supabaseAdmin
        .from('users')
        .insert({
          ...userData,
          id: uuidv4()
        })
        .select()
        .maybeSingle();

      if (insertError) {
        console.error('Error inserting user:', insertError);
        throw insertError;
      }

      return data;
    }
  } catch (error) {
    console.error('Error syncing user:', error);
    throw error;
  }
};

/**
 * Fetches a user from Supabase by Clerk ID
 * @param {string} clerkId - The Clerk user ID
 * @returns {Promise<object|null>} - The Supabase user record or null
 */
export const getUserByClerkId = async (clerkId) => {
  if (!clerkId) {
    return null;
  }

  try {
    // Use a more specific query approach with better error handling
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('clerk_id', clerkId)
      .maybeSingle(); // Use maybeSingle instead of single for better error handling

    if (error) {
      // Log the full error for debugging
      console.error('Error fetching user by Clerk ID:', error);

      // Check for different error scenarios
      if (error.code === 'PGRST116' || error.code === '406') {
        // No rows returned or API format issue
        console.error('User not found or API formatting issue:', error.message);
        return null;
      }

      throw error;
    }

    return data;
  } catch (error) {
    console.error('Unexpected error fetching user by Clerk ID:', error);
    // Don't throw, just return null to allow UI to handle gracefully
    return null;
  }
};