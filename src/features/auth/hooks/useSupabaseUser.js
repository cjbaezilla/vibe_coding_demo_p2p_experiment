/**
 * Custom hook to manage Supabase user state that syncs with Clerk
 * This hook fetches and syncs the user data between Clerk and Supabase
 */
import { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { syncUserWithSupabase, getUserByClerkId } from '../services/userService';

/**
 * Hook to get and manage the Supabase user that syncs with Clerk
 * @returns {object} The Supabase user state and loading status
 */
export const useSupabaseUser = () => {
  const { user: clerkUser, isLoaded: isClerkLoaded, isSignedIn } = useUser();
  const [supabaseUser, setSupabaseUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Don't do anything until Clerk is loaded
    if (!isClerkLoaded) {
      return;
    }

    // Reset state if user is not signed in
    if (!isSignedIn || !clerkUser) {
      setSupabaseUser(null);
      setIsLoading(false);
      return;
    }

    const syncUser = async () => {
      try {
        setIsLoading(true);

        // First try to get the existing user
        let userRecord = await getUserByClerkId(clerkUser.id);

        // If no user found or data needs updating, sync with Supabase
        if (!userRecord ||
            userRecord.email !== clerkUser.primaryEmailAddress?.emailAddress ||
            userRecord.full_name !== clerkUser.fullName ||
            userRecord.image_url !== clerkUser.imageUrl) {

          try {
            userRecord = await syncUserWithSupabase(clerkUser);
          } catch (syncError) {
            console.error('Error syncing user data:', syncError);
            // If sync fails, still use whatever user record we might have
          }
        }

        setSupabaseUser(userRecord);
        setError(null);
      } catch (err) {
        console.error('Error in useSupabaseUser hook:', err);
        setError(err);
        // Still set loading to false so UI doesn't hang
      } finally {
        setIsLoading(false);
      }
    };

    syncUser();
  }, [clerkUser, isClerkLoaded, isSignedIn]);

  return {
    supabaseUser,
    isLoading,
    error,
    refetch: async () => {
      if (clerkUser) {
        setIsLoading(true);
        try {
          const userRecord = await syncUserWithSupabase(clerkUser);
          setSupabaseUser(userRecord);
          setError(null);
        } catch (err) {
          console.error('Error refetching user data:', err);
          setError(err);
        } finally {
          setIsLoading(false);
        }
      }
    }
  };
};