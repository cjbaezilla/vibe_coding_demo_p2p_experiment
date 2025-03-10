/**
 * Component for displaying a list of chat messages
 */
import React, { useRef, useEffect } from 'react';
import styled from 'styled-components';
import ChatMessageItem from './ChatMessageItem';
import { Text, pulse } from '../../common/components/StyledComponents';

// Styled components
const MessageListContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: ${({ theme }) => theme.space.lg};
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(5px);
  position: relative;
  
  /* Custom scrollbar */
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  
  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.accent2}80;
    border-radius: ${({ theme }) => theme.borderRadius.full};
  }
  
  /* For Firefox */
  scrollbar-width: thin;
  scrollbar-color: ${({ theme }) => `${theme.colors.accent2}80 transparent`};
`;

const EmptyStateContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  color: ${({ theme }) => theme.colors.text.secondary};
  flex-direction: column;
  
  svg {
    width: 48px;
    height: 48px;
    margin-bottom: ${({ theme }) => theme.space.md};
    color: ${({ theme }) => theme.colors.tertiary};
    opacity: 0.7;
  }
`;

const LoadingIndicator = styled.div`
  animation: ${pulse} 1.5s infinite ease-in-out;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.space.sm};
  
  span {
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: ${({ theme }) => theme.colors.primary};
    
    &:nth-child(1) {
      animation: ${pulse} 1s infinite ease-in-out;
    }
    
    &:nth-child(2) {
      animation: ${pulse} 1s infinite ease-in-out 0.2s;
    }
    
    &:nth-child(3) {
      animation: ${pulse} 1s infinite ease-in-out 0.4s;
    }
  }
`;

const MessagesWrapper = styled.div`
  display: flex;
  flex-direction: column-reverse;
  padding-bottom: ${({ theme }) => theme.space.md};
`;

/**
 * Helper function to extract unique messages and prevent duplicates
 * @param {Array} messages - Array of chat messages
 * @returns {Array} Deduplicated array of messages
 */
const getUniqueMessages = (messages) => {
  if (!messages || messages.length === 0) {
    return [];
  }

  const uniqueIds = new Set();
  const tempMessageMap = new Map();
  const uniqueMessages = [];

  // Filter messages to remove duplicates
  for (const message of messages) {
    // For real messages (non-temporary)
    if (!message.id.toString().startsWith('temp-')) {
      // Skip if we've seen this ID before
      if (uniqueIds.has(message.id)) {
        continue;
      }

      // Add this ID to our set of seen IDs
      uniqueIds.add(message.id);

      // Check if we have a temporary version of this message
      const tempKey = `${message.user_id}:${message.message}`;

      // We use the real message and skip adding the temp version later
      if (tempMessageMap.has(tempKey)) {
        tempMessageMap.delete(tempKey);
      }

      uniqueMessages.push(message);
      continue;
    }

    // For temporary messages, track by user+content
    const tempKey = `${message.user_id}:${message.message}`;
    if (!tempMessageMap.has(tempKey)) {
      tempMessageMap.set(tempKey, message);
      uniqueMessages.push(message);
    }
  }

  return uniqueMessages;
};

/**
 * Chat message list component
 * @param {object} props - Component props
 * @param {Array} props.messages - List of message objects
 * @param {boolean} props.loading - Whether messages are loading
 * @param {boolean} props.isEmpty - Whether the message list is empty
 * @param {boolean} props.isJoined - Whether the user has joined the room
 * @returns {React.ReactElement} The component
 */
const ChatMessageList = ({
  messages,
  loading,
  isEmpty = !messages || messages.length === 0,
  isJoined = true
}) => {
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Get unique messages to display
  const uniqueMessages = getUniqueMessages(messages);

  return (
    <MessageListContainer data-testid="chat-message-list">
      {loading && !messages.length ? (
        <EmptyStateContainer>
          <LoadingIndicator>
            <span />
            <span />
            <span />
          </LoadingIndicator>
          <Text style={{ marginTop: '1rem' }}>Loading messages...</Text>
        </EmptyStateContainer>
      ) : isEmpty && !isJoined ? (
        <EmptyStateContainer>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 20.94c1.5 0 2.75 1.06 4 1.06 3 0 6-8 6-12.22A4.91 4.91 0 0 0 17 5c-2.22 0-4 1.44-5 2-1-.56-2.78-2-5-2a4.9 4.9 0 0 0-5 4.78C2 13 5 21 8 21c1.25 0 2.5-1.06 4-1.06z" />
            <path d="M10 2v8" />
            <path d="M14 2v8" />
          </svg>
          <Text>Join this room to see messages</Text>
        </EmptyStateContainer>
      ) : isEmpty ? (
        <EmptyStateContainer>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="8" y1="3" x2="8" y2="21" />
            <line x1="16" y1="3" x2="16" y2="21" />
            <line x1="3" y1="8" x2="21" y2="8" />
            <line x1="3" y1="16" x2="21" y2="16" />
          </svg>
          <Text>No messages yet. Start the conversation!</Text>
        </EmptyStateContainer>
      ) : (
        <MessagesWrapper>
          {/* Render messages in reverse order (newest at bottom) */}
          {uniqueMessages.map((message) => (
            <ChatMessageItem
              key={message.id}
              message={message}
            />
          ))}
          <div ref={messagesEndRef} /> {/* Empty div for auto-scroll */}
        </MessagesWrapper>
      )}
    </MessageListContainer>
  );
};

export default ChatMessageList;