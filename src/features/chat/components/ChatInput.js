/**
 * Component for chat message input
 */
import React, { useState } from 'react';

/**
 * Chat input component
 * @param {object} props - Component props
 * @param {Function} props.onSendMessage - Callback when message is sent
 * @param {boolean} props.disabled - Whether input is disabled
 * @returns {React.ReactElement} The component
 */
const ChatInput = ({ onSendMessage, disabled = false }) => {
  const [message, setMessage] = useState('');

  /**
   * Handle form submission
   * @param {Event} e - Form submit event
   */
  const handleSubmit = (e) => {
    e.preventDefault();

    const trimmedMessage = message.trim();
    if (!trimmedMessage) {
      return;
    }

    // Send message and clear input
    onSendMessage(trimmedMessage);
    setMessage('');
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="border-t border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-900"
      data-testid="chat-input-form"
    >
      <div className="flex items-center">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={disabled ? 'Join the room to chat' : 'Type a message...'}
          disabled={disabled}
          className="flex-1 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white
                    rounded-lg py-2 px-4 mr-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          data-testid="chat-input-field"
        />
        <button
          type="submit"
          disabled={disabled || !message.trim()}
          className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg
                    disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500"
          data-testid="chat-send-button"
        >
          Send
        </button>
      </div>
    </form>
  );
};

export default ChatInput;