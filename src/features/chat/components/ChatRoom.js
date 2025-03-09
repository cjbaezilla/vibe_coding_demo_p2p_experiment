/**
 * Main component for a chat room that integrates all chat subcomponents
 */
import React, { useEffect } from 'react';
import styled from 'styled-components';
import { useChatRoom } from '../hooks/useChatRoom';
import ChatMessageList from './ChatMessageList';
import ChatInput from './ChatInput';
import OnlineUsersList from './OnlineUsersList';
import {
  PrimaryButton, Card, Text, Subtitle, SlideUp, FadeIn
} from '../../common/components/StyledComponents';

// Styled components for ChatRoom
const ChatRoomContainer = styled.div`
  display: flex;
  height: 100%;
  overflow: hidden;
  position: relative;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
`;

const MainChatArea = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
  position: relative;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  border-radius: ${({ theme }) => theme.borderRadius.lg} 0 0 ${({ theme }) => theme.borderRadius.lg};
`;

const SidePanel = styled.div`
  width: 280px;
  border-left: 1px solid ${({ theme }) => theme.colors.accent3};
  padding: ${({ theme }) => theme.space.md};
  overflow-y: auto;
  background: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(5px);
  border-radius: 0 ${({ theme }) => theme.borderRadius.lg} ${({ theme }) => theme.borderRadius.lg} 0;
  
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
  
  @media (max-width: 1024px) {
    display: none;
  }
`;

const RoomBanner = styled.div`
  padding: ${({ theme }) => theme.space.md};
  display: flex;
  justify-content: ${(props) => props.justifyContent || 'space-between'};
  align-items: center;
  border-bottom: 1px solid ${({ theme }) => theme.colors.accent3};
  
  ${(props) => props.joining && `
    background: linear-gradient(to right, 
      ${props.theme.colors.secondary}20, 
      ${props.theme.colors.primary}20
    );
  `}
  
  ${(props) => props.leaving && `
    background: linear-gradient(to right, 
      ${props.theme.colors.accent3}, 
      ${props.theme.colors.background}
    );
  `}
`;

const BannerText = styled(Text)`
  color: ${({ theme, variant }) =>
    variant === 'error'
      ? theme.colors.error
      : variant === 'primary'
        ? theme.colors.primary
        : theme.colors.text.primary
  };
  font-weight: 500;
  margin: 0;
`;

const JoinButton = styled(PrimaryButton)`
  background: linear-gradient(45deg, 
    ${({ theme }) => theme.colors.secondary}, 
    ${({ theme }) => theme.colors.primary}
  );
  font-size: ${({ theme }) => theme.fontSizes.sm};
  padding: ${({ theme }) => `${theme.space.xs} ${theme.space.md}`};
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const LeaveButton = styled(PrimaryButton)`
  background: linear-gradient(45deg, 
    ${({ theme }) => theme.colors.error}, 
    ${({ theme }) => theme.colors.accent1}
  );
  font-size: ${({ theme }) => theme.fontSizes.sm};
  padding: ${({ theme }) => `${theme.space.xs} ${theme.space.md}`};
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const SmallLeaveButton = styled(LeaveButton)`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  padding: ${({ theme }) => `${theme.space.xs} ${theme.space.sm}`};
`;

const EmptyStateContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: center;
  align-items: center;
  padding: ${({ theme }) => theme.space.xl};
  text-align: center;
  
  svg {
    width: 64px;
    height: 64px;
    margin-bottom: ${({ theme }) => theme.space.md};
    color: ${({ variant, theme }) =>
      variant === 'error'
        ? theme.colors.error
        : theme.colors.tertiary
    };
  }
`;

const MembersCard = styled(Card)`
  margin-top: ${({ theme }) => theme.space.md};
  background: rgba(255, 255, 255, 0.8);
`;

const MembersHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.space.md};
`;

const MembersList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  
  li {
    display: flex;
    align-items: center;
    padding: ${({ theme }) => theme.space.sm} 0;
    
    &:not(:last-child) {
      border-bottom: 1px dashed ${({ theme }) => theme.colors.accent3};
    }
  }
`;

const MemberImage = styled.img`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  margin-right: ${({ theme }) => theme.space.sm};
  border: 2px solid ${({ theme, online }) =>
    online ? theme.colors.success : 'transparent'
  };
`;

const MemberName = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.text.primary};
  display: flex;
  align-items: center;
`;

const OnlineIndicator = styled.span`
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.colors.success};
  margin-left: ${({ theme }) => theme.space.sm};
`;

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
      <EmptyStateContainer variant="error">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <Subtitle>This room no longer exists</Subtitle>
        <Text>It may have been deleted by its creator or automatically removed.</Text>
      </EmptyStateContainer>
    );
  }

  if (!roomId) {
    return (
      <EmptyStateContainer>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <line x1="8" y1="12" x2="16" y2="12" />
          <line x1="12" y1="8" x2="12" y2="16" />
        </svg>
        <Subtitle>Select a chat room to start messaging</Subtitle>
        <Text>Or create a new room to begin a conversation</Text>
      </EmptyStateContainer>
    );
  }

  if (error) {
    return (
      <EmptyStateContainer variant="error">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <Subtitle>Error loading chat room</Subtitle>
        <Text>{error}</Text>
        <JoinButton onClick={joinRoom} style={{ marginTop: '1rem' }}>
          Try Again
        </JoinButton>
      </EmptyStateContainer>
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
    <ChatRoomContainer>
      {/* Main Chat Area */}
      <MainChatArea>
        {/* Join Room Banner (if not joined) */}
        {!hasJoined && (
          <SlideUp>
            <RoomBanner joining>
              <BannerText variant="primary">
                Join this room to start chatting
              </BannerText>
              <JoinButton
                onClick={joinRoom}
                disabled={loading}
              >
                {loading ? 'Joining...' : 'Join Room'}
              </JoinButton>
            </RoomBanner>
          </SlideUp>
        )}

        {/* Leave Room Banner (if joined) */}
        {hasJoined && (
          <SlideUp>
            <RoomBanner justifyContent="flex-end" leaving>
              <LeaveButton
                onClick={handleLeaveRoom}
                disabled={loading}
              >
                {loading ? 'Leaving...' : 'Leave Room'}
              </LeaveButton>
            </RoomBanner>
          </SlideUp>
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
      </MainChatArea>

      {/* Side Panel - Members & Online Users */}
      <FadeIn>
        <SidePanel>
          {/* Online Users List */}
          <OnlineUsersList users={onlineUsers} />

          {/* Room Members Section (if joined) */}
          {hasJoined && members.length > 0 && (
            <MembersCard>
              <MembersHeader>
                <Subtitle style={{ margin: 0, fontSize: '1.1rem' }}>Room Members</Subtitle>
                <SmallLeaveButton
                  onClick={handleLeaveRoom}
                  disabled={loading}
                >
                  {loading ? 'Leaving...' : 'Leave'}
                </SmallLeaveButton>
              </MembersHeader>

              <MembersList>
                {members.map((member) => (
                  <li key={member.id}>
                    <MemberImage
                      src={member.users?.image_url || 'https://via.placeholder.com/32'}
                      alt={member.users?.full_name || 'User'}
                      online={member.isOnline}
                    />
                    <MemberName>
                      {member.users?.full_name || 'Unknown User'}
                      {member.isOnline && <OnlineIndicator />}
                    </MemberName>
                  </li>
                ))}
              </MembersList>
            </MembersCard>
          )}
        </SidePanel>
      </FadeIn>
    </ChatRoomContainer>
  );
};

export default ChatRoom;