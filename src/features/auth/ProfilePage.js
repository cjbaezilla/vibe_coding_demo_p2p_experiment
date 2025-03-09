import React from 'react';
import { useUser } from '@clerk/clerk-react';
import { useSupabaseUserContext } from './contexts/SupabaseUserProvider';
import { formatTimeSince } from '../common/utils/dateUtils';

/**
 * Component that displays user profile information
 * Shows data from both Clerk and Supabase
 * @returns {React.ReactElement} The rendered profile page
 */
const ProfilePage = () => {
  const { user } = useUser();
  const { supabaseUser, isLoading: isSupabaseLoading, error: supabaseError } = useSupabaseUserContext();

  if (!user) {
    return <div className="container mx-auto px-4 py-8">Loading user data...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Your Profile</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6 max-w-3xl mx-auto mb-8">
        <div className="flex items-center mb-6">
          {user.imageUrl && (
            <img 
              src={user.imageUrl} 
              alt="Profile" 
              className="w-16 h-16 rounded-full mr-4"
            />
          )}
          <div>
            <h2 className="text-xl font-bold">{user.fullName || 'User'}</h2>
            <p className="text-gray-600">{user.primaryEmailAddress?.emailAddress}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Clerk Account Information */}
          <div className="border rounded-lg p-4">
            <h3 className="font-bold text-lg mb-2 border-b pb-2">Clerk Account</h3>
            <p className="py-1"><span className="font-medium">ID:</span> {user.id}</p>
            <p className="py-1"><span className="font-medium">Email:</span> {user.primaryEmailAddress?.emailAddress}</p>
            <p className="py-1"><span className="font-medium">Member since:</span> {formatTimeSince(user.createdAt)}</p>
          </div>
          
          {/* Supabase User Information */}
          <div className="border rounded-lg p-4">
            <h3 className="font-bold text-lg mb-2 border-b pb-2">Supabase Data</h3>
            {supabaseError ? (
              <div className="p-3 bg-red-50 text-red-700 rounded-md">
                <p className="font-medium">Error connecting to database</p>
                <p className="text-sm mt-1">Please try again later or contact support</p>
              </div>
            ) : isSupabaseLoading ? (
              <p>Loading Supabase data...</p>
            ) : supabaseUser ? (
              <>
                <p className="py-1"><span className="font-medium">ID:</span> {supabaseUser.id}</p>
                <p className="py-1"><span className="font-medium">Clerk ID:</span> {supabaseUser.clerk_id}</p>
                <p className="py-1">
                  <span className="font-medium">Created at:</span> {formatTimeSince(supabaseUser.created_at)}
                </p>
                <p className="py-1">
                  <span className="font-medium">Last updated:</span> {formatTimeSince(supabaseUser.updated_at)}
                </p>
              </>
            ) : (
              <div className="p-3 bg-yellow-50 text-yellow-700 rounded-md">
                <p>Your Supabase user record hasn't been created yet.</p>
                <p className="text-sm mt-1">This may happen the first time you log in.</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="text-center text-sm text-gray-500">
        <p>Your account is synchronized between Clerk (authentication) and Supabase (data storage)</p>
      </div>
    </div>
  );
};

export default ProfilePage; 