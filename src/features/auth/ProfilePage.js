import React from 'react';
import { useUser } from '@clerk/clerk-react';

const ProfilePage = () => {
  const { user } = useUser();

  if (!user) return <div>Loading...</div>;

  return (
    <div className="container mx-auto px-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Your Profile</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6 max-w-md mx-auto">
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
        
        <div className="border-t pt-4">
          <h3 className="font-bold mb-2">Account Information</h3>
          <p><span className="font-medium">ID:</span> {user.id}</p>
          <p><span className="font-medium">Created:</span> {new Date(user.createdAt).toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage; 