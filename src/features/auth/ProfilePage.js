import React from 'react';
import { useUser } from '@clerk/clerk-react';

const ProfilePage = () => {
  const { user } = useUser();

  if (!user) return <div>Loading...</div>;

  // Format date to show time since creation
  const formatTimeSince = (dateString) => {
    const createdAt = new Date(dateString);
    const now = new Date();
    
    const seconds = Math.floor((now - createdAt) / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);
    
    if (years > 0) {
      return `${years} ${years === 1 ? 'year' : 'years'} ago`;
    } else if (months > 0) {
      return `${months} ${months === 1 ? 'month' : 'months'} ago`;
    } else if (days > 0) {
      return `${days} ${days === 1 ? 'day' : 'days'} ago`;
    } else if (hours > 0) {
      return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
    } else if (minutes > 0) {
      return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
    } else {
      return 'just now';
    }
  };

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
          <p><span className="font-medium">Member since:</span> {formatTimeSince(user.createdAt)}</p>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage; 