/**
 * Component for displaying a list of chat messages
 */
import React, { useRef, useEffect } from 'react';
import ChatMessageItem from './ChatMessageItem';

/**
 * Chat message list component
 * @param {object} props - Component props
 * @param {Array} props.messages - List of message objects
 * @param {boolean} props.loading - Whether messages are loading
 * @returns {React.ReactElement} The component
 */
const ChatMessageList = ({ messages, loading }) => {
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Check if messages array is empty
  const isEmpty = !messages || messages.length === 0;

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
      ) : isEmpty ? (
        <div className="flex justify-center items-center h-full">
          <div className="text-gray-500 dark:text-gray-400">
            No messages yet. Start the conversation!
          </div>
        </div>
      ) : (
        <div className="flex flex-col-reverse">
          {/* Render messages in reverse order (newest at bottom) */}
          {messages.map((message) => (
            <ChatMessageItem
              key={message.id}
              message={message}
              isTemporary={message.id.toString().startsWith('temp-')}
            />
          ))}
          <div ref={messagesEndRef} />
        </div>
      )}
    </div>
  );
};

export default ChatMessageList;