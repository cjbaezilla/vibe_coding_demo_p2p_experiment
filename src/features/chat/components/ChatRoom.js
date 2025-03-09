/**
 * Main component for a chat room that integrates all chat subcomponents
 */
import React, { useEffect } from 'react';
import { useChatRoom } from '../hooks/useChatRoom';
import ChatMessageList from './ChatMessageList';
import ChatInput from './ChatInput';
import OnlineUsersList from './OnlineUsersList';

/**
 * Chat room component
 * @param {object} props - Component props
 * @param {string} props.roomId - ID of the room to display
 * @returns {React.ReactElement} The component
 */
const ChatRoom = ({ roomId }) => {
  // No need to log roomId changes
  useEffect(() => {
    // Component mounted with roomId
  }, [roomId]);

  const {
    messages,
    members,
    onlineUsers,
    hasJoined,
    loading,
    error,
    sendMessage,
    joinRoom,
    leaveRoom,
    roomExists
  } = useChatRoom(roomId);

  // If the room doesn't exist anymore, show a message
  if (!roomExists) {
    return (
      <div className="flex flex-col h-full items-center justify-center text-red-500 p-8">
        <p className="text-xl mb-4">This room no longer exists</p>
        <p>It may have been deleted by its creator or automatically removed.</p>
      </div>
    );
  }

  if (!roomId) {
    return (
      <div className="flex flex-col h-full items-center justify-center text-gray-500 dark:text-gray-400 p-8">
        <p className="text-xl mb-4">Select a chat room to start messaging</p>
        <p>Or create a new room to begin a conversation</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col h-full items-center justify-center text-red-500 p-8">
        <p className="text-xl mb-4">Error loading chat room</p>
        <p>{error}</p>
        <button
          onClick={joinRoom}
          className="mt-4 bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded
                   focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Try Again
        </button>
      </div>
    );
  }

  // Leave room action handler with feedback
  const handleLeaveRoom = async () => {
    try {
      await leaveRoom();
      // UI state will be updated by the real-time subscription and leaveRoom function
    } catch (error) {
      // Use console.error which is allowed by ESLint config
      console.error('Error leaving room:', error);
      // You could add error toast/notification here if needed
    }
  };

  return (
    <div className="flex h-full">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full">
        {/* Join Room Banner (if not joined) */}
        {!hasJoined && (
          <div className="bg-blue-50 dark:bg-blue-900 p-4 border-b border-blue-200 dark:border-blue-800">
            <div className="flex justify-between items-center">
              <p className="text-blue-700 dark:text-blue-300">
                Join this room to start chatting
              </p>
              <button
                onClick={joinRoom}
                disabled={loading}
                className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-1 px-4 rounded text-sm
                         disabled:opacity-50"
              >
                {loading ? 'Joining...' : 'Join Room'}
              </button>
            </div>
          </div>
        )}

        {/* Leave Room Banner (if joined) */}
        {hasJoined && (
          <div className="bg-gray-50 dark:bg-gray-900 p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex justify-end items-center">
              <button
                onClick={handleLeaveRoom}
                disabled={loading}
                className="bg-red-500 hover:bg-red-600 text-white font-medium py-1 px-4 rounded text-sm
                         disabled:opacity-50"
              >
                {loading ? 'Leaving...' : 'Leave Room'}
              </button>
            </div>
          </div>
        )}

        {/* Message List */}
        <ChatMessageList
          messages={messages}
          loading={loading}
          isEmpty={messages.length === 0}
          isJoined={hasJoined}
        />

        {/* Chat Input */}
        <ChatInput
          onSendMessage={sendMessage}
          disabled={!hasJoined || loading}
        />
      </div>

      {/* Side Panel - Members & Online Users */}
      <div className="w-64 border-l border-gray-200 dark:border-gray-700 p-4 hidden lg:block overflow-y-auto
                    bg-gray-50 dark:bg-gray-800">
        <div className="space-y-4">
          {/* Online Users List */}
          <OnlineUsersList users={onlineUsers} />

          {/* Room Members Section (if joined) */}
          {hasJoined && members.length > 0 && (
            <div className="bg-gray-100 dark:bg-gray-900 p-4 rounded-lg shadow-md">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Room Members</h2>
                <button
                  onClick={handleLeaveRoom}
                  disabled={loading}
                  className="text-xs bg-red-500 hover:bg-red-600 text-white font-medium py-1 px-2 rounded
                           focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
                >
                  {loading ? 'Leaving...' : 'Leave'}
                </button>
              </div>
              <ul className="space-y-2">
                {members.map((member) => (
                  <li key={member.id} className="flex items-center">
                    <img
                      src={member.users?.image_url || 'https://via.placeholder.com/32'}
                      alt={member.users?.full_name || 'User'}
                      className="h-8 w-8 rounded-full mr-2"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {member.users?.full_name || 'Unknown User'}
                      {member.isOnline && (
                        <span className="inline-block ml-2 h-2 w-2 rounded-full bg-green-400" />
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatRoom;