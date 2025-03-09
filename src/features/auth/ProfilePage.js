import React from 'react';
import { useUser } from '@clerk/clerk-react';
import { Link } from 'react-router-dom';
import { useSupabaseUserContext } from './contexts/SupabaseUserProvider';
import { formatTimeSince } from '../common/utils/dateUtils';

/**
 * Component that displays user profile information
 * Shows data from both Clerk and Supabase
 * @returns {React.ReactElement} The rendered profile page
 */
const ProfilePage = () => {
  const { user } = useUser();
  const {
    supabaseUser,
    isLoading: isSupabaseLoading,
    error: supabaseError
  } = useSupabaseUserContext();

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

        {/* Quick Actions Section */}
        <div className="mb-8">
          <h3 className="font-bold text-lg mb-4 border-b pb-2">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              to="/chat"
              className="flex items-center justify-center py-3 px-4 bg-blue-600 hover:bg-blue-700
                text-white rounded-lg transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2
                    11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z"
                  clipRule="evenodd"
                />
              </svg>
              Real-time Chat
              <span className="ml-2 inline-block w-2 h-2 rounded-full bg-green-500" />
            </Link>
            <button
              className="py-3 px-4 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition-colors"
              onClick={() => {/* Additional action placeholder */}}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2 inline"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106
                    2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836
                    1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533
                    0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6
                    0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947z
                    M10 13a3 3 0 100-6 3 3 0 000 6z"
                  clipRule="evenodd"
                />
              </svg>
              Settings
            </button>
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