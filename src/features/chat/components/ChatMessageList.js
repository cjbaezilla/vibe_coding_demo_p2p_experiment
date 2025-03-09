/**
 * Component for displaying a list of chat messages
 */
import React, { useRef, useEffect } from 'react';
import ChatMessageItem from './ChatMessageItem';

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
    <div
      className="flex-1 overflow-y-auto p-4 bg-white dark:bg-gray-800"
      data-testid="chat-message-list"
    >
      {loading && !messages.length ? (
        <div className="flex justify-center items-center h-full">
          <div className="animate-pulse text-gray-500 dark:text-gray-400">
            Loading messages...
          </div>
        </div>
      ) : isEmpty && !isJoined ? (
        <div className="flex justify-center items-center h-full">
          <div className="text-gray-500 dark:text-gray-400">
            Join this room to see messages
          </div>
        </div>
      ) : isEmpty ? (
        <div className="flex justify-center items-center h-full">
          <div className="text-gray-500 dark:text-gray-400">
            No messages yet. Start the conversation!
          </div>
        </div>
      ) : (
        <div className="flex flex-col-reverse">
          {/* Render messages in reverse order (newest at bottom) */}
          {uniqueMessages.map((message) => (
            <ChatMessageItem
              key={message.id}
              message={message}
            />
          ))}
          <div ref={messagesEndRef} /> {/* Empty div for auto-scroll */}
        </div>
      )}
    </div>
  );
};

export default ChatMessageList;