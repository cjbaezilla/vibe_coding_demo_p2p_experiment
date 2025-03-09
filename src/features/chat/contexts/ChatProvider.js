/**
 * Context provider for chat functionality
 * This provides chat state and operations throughout the application
 */
import React, { createContext, useContext } from 'react';
import { useChatRooms } from '../hooks/useChatRooms';

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

  return (
    <ChatContext.Provider value={chatState}>
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