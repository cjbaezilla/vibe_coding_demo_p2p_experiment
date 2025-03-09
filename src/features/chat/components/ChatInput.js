/**
 * Component for chat message input
 */
import React, { useState } from 'react';
import styled from 'styled-components';
import { PrimaryButton } from '../../common/components/StyledComponents';

// Styled components
const InputContainer = styled.form`
  padding: ${({ theme }) => theme.space.md};
  border-top: 1px solid ${({ theme }) => theme.colors.accent3};
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  border-radius: 0 0 ${({ theme }) => theme.borderRadius.lg} 0 ${({ theme }) => theme.borderRadius.lg};
`;

const InputWrapper = styled.div`
  display: flex;
  align-items: center;
  position: relative;
`;

const MessageInput = styled.input`
  flex: 1;
  border: 2px solid ${({ theme }) => theme.colors.accent3};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  padding: ${({ theme }) => theme.space.md} ${({ theme }) => theme.space.lg};
  font-size: ${({ theme }) => theme.fontSizes.md};
  transition: ${({ theme }) => theme.transitions.quick};
  background: rgba(255, 255, 255, 0.9);
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primary}30;
  }
  
  &::placeholder {
    color: ${({ theme }) => theme.colors.text.secondary};
    opacity: 0.7;
  }
  
  &:disabled {
    background-color: ${({ theme }) => theme.colors.accent3};
    cursor: not-allowed;
    opacity: 0.8;
  }
`;

const SendButton = styled(PrimaryButton)`
  margin-left: ${({ theme }) => theme.space.sm};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  background: linear-gradient(45deg, 
    ${({ theme }) => theme.colors.primary}, 
    ${({ theme }) => theme.colors.secondary}
  );
  padding: ${({ theme }) => `${theme.space.sm} ${theme.space.lg}`};
  font-weight: 600;
  transition: ${({ theme }) => theme.transitions.bounce};
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.shadows.md};
  }
  
  svg {
    width: 20px;
    height: 20px;
  }
`;

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
    <InputContainer
      onSubmit={handleSubmit}
      data-testid="chat-input-form"
    >
      <InputWrapper>
        <MessageInput
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={disabled ? 'Join the room to chat' : 'Type a message...'}
          disabled={disabled}
          data-testid="chat-input-field"
        />
        <SendButton
          type="submit"
          disabled={disabled || !message.trim()}
          data-testid="chat-send-button"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </SendButton>
      </InputWrapper>
    </InputContainer>
  );
};

export default ChatInput;