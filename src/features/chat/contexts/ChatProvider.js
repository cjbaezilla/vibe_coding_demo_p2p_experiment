/**
 * Context provider for chat functionality
 * This provides chat state and operations throughout the application
 */
import React, { createContext, useContext, useCallback } from 'react';
import { useChatRooms } from '../hooks/useChatRooms';
import { useChatRealtime } from '../hooks/useChatRealtime';

// Create context
const ChatContext = createContext(null);

/**
 * Provider component that wraps app and provides chat context
 * @param {object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @returns {React.ReactElement} The provider component
 */
export const ChatProvider = ({ children }) => {
  const chatState = useChatRooms();

  // Handle online users changes to check for empty rooms
  const handleOnlineUsersChange = useCallback((onlineUsers) => {
    if (onlineUsers && onlineUsers.length >= 0) {
      // Check and delete empty rooms
      chatState.checkEmptyRooms(onlineUsers);
    }
  }, [chatState]);

  // Subscribe to real-time updates with no specific room ID
  const realtimeState = useChatRealtime(null, handleOnlineUsersChange);

  // Combine the chat state with the realtime state
  const combinedState = {
    ...chatState,
    onlineUsers: realtimeState.onlineUsers,
    isSubscribed: realtimeState.isSubscribed
  };

  return (
    <ChatContext.Provider value={combinedState}>
      {children}
    </ChatContext.Provider>
  );
};

/**
 * Hook to use the chat context
 * @returns {object} Chat context value
 */
export const useChatContext = () => {
  const context = useContext(ChatContext);

  if (context === null) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }

  return context;
};