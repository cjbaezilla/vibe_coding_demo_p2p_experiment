/**
 * Component for displaying a list of online users
 */
import React from 'react';
import { isUserOnline } from '../utils/dateUtils';

/**
 * Online users list component
 * @param {object} props - Component props
 * @param {Array} props.users - List of user objects with last_seen_at
 * @returns {React.ReactElement} The component
 */
const OnlineUsersList = ({ users = [] }) => {
  if (!users || users.length === 0) {
    return (
      <div className="bg-gray-100 dark:bg-gray-900 p-4 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Online Users</h2>
        <div className="text-center py-2 text-gray-500 dark:text-gray-400 text-sm">
          No users online
        </div>
      </div>
    );
  }

  // Filter and sort users
  const sortedUsers = [...users]
    .filter((user) => user.last_seen_at)
    .sort((a, b) => {
      // Sort online users first, then by name
      const aOnline = isUserOnline(a.last_seen_at);
      const bOnline = isUserOnline(b.last_seen_at);

      if (aOnline && !bOnline) {
        return -1;
      }
      if (!aOnline && bOnline) {
        return 1;
      }

      return (a.full_name || '').localeCompare(b.full_name || '');
    });

  return (
    <div className="bg-gray-100 dark:bg-gray-900 p-4 rounded-lg shadow-md">
      <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Online Users</h2>
      <ul className="space-y-2">
        {sortedUsers.map((user) => {
          const online = isUserOnline(user.last_seen_at);

          return (
            <li key={user.id} className="flex items-center">
              <div className="relative mr-2">
                <img
                  src={user.image_url || 'https://via.placeholder.com/32'}
                  alt={user.full_name || 'User'}
                  className="h-8 w-8 rounded-full"
                />
                <span
                  className={`absolute bottom-0 right-0 block h-2 w-2 rounded-full ${
                    online ? 'bg-green-400' : 'bg-gray-400'
                  }`}
                />
              </div>
              <span className={`text-sm ${
                online
                  ? 'font-medium text-gray-800 dark:text-white'
                  : 'text-gray-500 dark:text-gray-400'
              }`}>
                {user.full_name || 'Unknown User'}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default OnlineUsersList;