/**
 * Component for displaying a single chat message
 */
import React from 'react';
import { useSupabaseUserContext } from '../../auth/contexts/SupabaseUserProvider';
import { formatMessageTime } from '../utils/dateUtils';

/**
 * Chat message item component
 * @param {object} props - Component props
 * @param {object} props.message - Message data
 * @param {boolean} props.isTemporary - Whether this is a temporary message (optimistic update)
 * @returns {React.ReactElement} The component
 */
const ChatMessageItem = ({ message, isTemporary = false }) => {
  const { supabaseUser } = useSupabaseUserContext();
  const isCurrentUser = message.user_id === supabaseUser?.id;

  // Format timestamp
  const formattedTime = formatMessageTime(message.created_at);

  // Get user info
  const userName = message.users?.full_name || 'Unknown User';
  const userImage = message.users?.image_url || 'https://via.placeholder.com/40';

  return (
    <div
      className={`flex mb-4 ${isCurrentUser ? 'justify-end' : 'justify-start'} ${isTemporary ? 'opacity-70' : ''}`}
      data-testid="chat-message-item"
    >
      {!isCurrentUser && (
        <div className="flex-shrink-0 mr-3">
          <img
            src={userImage}
            alt={userName}
            className="h-10 w-10 rounded-full"
          />
        </div>
      )}

      <div className={`max-w-md ${isCurrentUser ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'} 
                      rounded-lg px-4 py-2 shadow`}>
        {!isCurrentUser && (
          <div className="font-semibold text-sm mb-1">{userName}</div>
        )}
        <div className="text-base">{message.message}</div>
        <div className="text-xs mt-1 opacity-75 text-right">
          {formattedTime}
          {isTemporary && <span className="ml-2">Sending...</span>}
        </div>
      </div>

      {isCurrentUser && (
        <div className="flex-shrink-0 ml-3">
          <img
            src={userImage}
            alt={userName}
            className="h-10 w-10 rounded-full"
          />
        </div>
      )}
    </div>
  );
};

export default ChatMessageItem;