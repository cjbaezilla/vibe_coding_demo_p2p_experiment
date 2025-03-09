/**
 * Component for displaying a single chat message
 */
import React from 'react';
import styled from 'styled-components';
import { useSupabaseUserContext } from '../../auth/contexts/SupabaseUserProvider';
import { formatMessageTime } from '../utils/dateUtils';

// Styled components
const MessageContainer = styled.div`
  display: flex;
  margin-bottom: ${({ theme }) => theme.space.md};
  justify-content: ${(props) => props.isCurrentUser ? 'flex-end' : 'flex-start'};
  opacity: ${(props) => props.isTemporary ? 0.7 : 1};
  transform: scale(${(props) => props.isTemporary ? 0.98 : 1});
  transition: all 0.3s ease;
`;

const MessageAvatar = styled.div`
  flex-shrink: 0;
  margin-right: ${(props) => props.isCurrentUser ? 0 : props.theme.space.md};
  margin-left: ${(props) => props.isCurrentUser ? props.theme.space.md : 0};
  
  img {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid ${({ theme, isCurrentUser }) =>
      isCurrentUser ? theme.colors.primary : theme.colors.secondary};
    box-shadow: ${({ theme }) => theme.shadows.sm};
  }
`;

const MessageBubble = styled.div`
  max-width: 75%;
  border-radius: ${({ theme, isCurrentUser }) =>
    isCurrentUser
      ? `${theme.borderRadius.lg} ${theme.borderRadius.lg} 0 ${theme.borderRadius.lg}`
      : `${theme.borderRadius.lg} ${theme.borderRadius.lg} ${theme.borderRadius.lg} 0`
  };
  padding: ${({ theme }) => theme.space.md};
  
  background: ${({ theme, isCurrentUser }) =>
    isCurrentUser
      ? `linear-gradient(45deg, ${theme.colors.primary}, ${theme.colors.accent1})`
      : `linear-gradient(45deg, ${theme.colors.secondary}40, ${theme.colors.tertiary}40)`
  };
  
  color: ${({ theme, isCurrentUser }) =>
    isCurrentUser ? theme.colors.text.light : theme.colors.text.primary};
  box-shadow: ${({ theme }) => theme.shadows.sm};
  position: relative;
  
  &:after {
    content: '';
    position: absolute;
    bottom: 0;
    width: 10px;
    height: 10px;
    ${({ isCurrentUser }) => isCurrentUser
      ? `right: -7px; 
         border-left: 10px solid transparent;
         border-right: 0 solid transparent;`
      : `left: -7px;
         border-right: 10px solid transparent;
         border-left: 0 solid transparent;`
    }
    border-bottom: 10px solid ${({ theme, isCurrentUser }) =>
      isCurrentUser
        ? theme.colors.accent1
        : theme.colors.tertiary + '40'
    };
    transform: ${({ isCurrentUser }) => isCurrentUser ? 'rotate(0deg)' : 'rotate(0deg)'};
  }
`;

const SenderName = styled.div`
  font-weight: 600;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  margin-bottom: ${({ theme }) => theme.space.xs};
  color: ${({ theme }) => theme.colors.accent1};
  opacity: 0.9;
`;

const MessageText = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.md};
  line-height: 1.4;
  word-break: break-word;
`;

const MessageInfo = styled.div`
  text-align: right;
  margin-top: ${({ theme }) => theme.space.xs};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  opacity: 0.7;
  
  ${({ isTemporary, theme }) => isTemporary && `
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    &:before {
      content: 'Sending...';
      font-style: italic;
      color: ${theme.colors.text.secondary};
      opacity: 0.8;
    }
  `}
`;

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
    <MessageContainer
      isCurrentUser={isCurrentUser}
      isTemporary={isTemporary}
      data-testid="chat-message-item"
    >
      {!isCurrentUser && (
        <MessageAvatar isCurrentUser={isCurrentUser}>
          <img
            src={userImage}
            alt={userName}
          />
        </MessageAvatar>
      )}

      <MessageBubble isCurrentUser={isCurrentUser}>
        {!isCurrentUser && (
          <SenderName>{userName}</SenderName>
        )}
        <MessageText>{message.message}</MessageText>
        <MessageInfo isTemporary={isTemporary}>
          {formattedTime}
        </MessageInfo>
      </MessageBubble>

      {isCurrentUser && (
        <MessageAvatar isCurrentUser={isCurrentUser}>
          <img
            src={userImage}
            alt={userName}
          />
        </MessageAvatar>
      )}
    </MessageContainer>
  );
};

export default ChatMessageItem;