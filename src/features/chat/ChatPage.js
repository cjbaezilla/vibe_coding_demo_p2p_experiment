/**
 * Main chat page component that integrates all chat functionality
 */
import React from 'react';
import styled from 'styled-components';
import { ChatProvider, useChatContext } from './contexts/ChatProvider';
import ChatRoomList from './components/ChatRoomList';
import ChatRoom from './components/ChatRoom';
import { SlideUp, SlideDown } from '../common/components/StyledComponents';

// Styled components for the chat interface
const ChatContainer = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  background: linear-gradient(
    to bottom right,
    ${({ theme }) => theme.colors.background},
    ${({ theme }) => theme.colors.accent3}
  );
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  overflow: hidden;
`;

const ChatHeader = styled.header`
  background: linear-gradient(
    90deg,
    ${({ theme }) => theme.colors.primary},
    ${({ theme }) => theme.colors.accent1}
  );
  color: ${({ theme }) => theme.colors.text.light};
  padding: ${({ theme }) => theme.space.lg};
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: -50%;
    right: -50%;
    width: 100px;
    height: 100px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.1);
    z-index: 0;
  }
  
  &::after {
    content: '';
    position: absolute;
    bottom: -30%;
    left: 10%;
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.1);
    z-index: 0;
  }
`;

const HeaderContent = styled.div`
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
`;

const ChatTitle = styled.h1`
  font-size: ${({ theme }) => theme.fontSizes['2xl']};
  font-weight: 700;
  margin: 0;
  display: flex;
  align-items: center;
  
  &::before {
    content: '';
    display: inline-block;
    width: 12px;
    height: 12px;
    margin-right: ${({ theme }) => theme.space.sm};
    background: ${({ theme }) => theme.colors.success};
    border-radius: 50%;
    box-shadow: 0 0 8px ${({ theme }) => theme.colors.success};
    animation: pulse 2s infinite;
  }
`;

const ChatContent = styled.main`
  flex: 1;
  display: flex;
  overflow: hidden;
`;

const Sidebar = styled.div`
  width: 320px;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(8px);
  border-right: 1px solid ${({ theme }) => theme.colors.accent3};
  overflow-y: auto;
  transition: ${({ theme }) => theme.transitions.default};
  position: relative;
  
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
`;

const ChatArea = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
  background: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(10px);
`;

/**
 * Inner component that uses the chat context
 * @returns {React.ReactElement} The component
 */
const ChatPageContent = () => {
  const {
    rooms,
    selectedRoomId,
    loading,
    createRoom,
    selectRoom
  } = useChatContext();

  // Enhanced select room handler without logging
  const handleSelectRoom = (roomId) => {
    selectRoom(roomId);
  };

  return (
    <ChatContent>
      <SlideUp duration="0.5s">
        <Sidebar>
          <ChatRoomList
            rooms={rooms}
            selectedRoomId={selectedRoomId}
            onSelectRoom={handleSelectRoom}
            onCreateRoom={createRoom}
            loading={loading}
          />
        </Sidebar>
      </SlideUp>

      <SlideDown duration="0.5s">
        <ChatArea>
          <ChatRoom roomId={selectedRoomId} />
        </ChatArea>
      </SlideDown>
    </ChatContent>
  );
};

/**
 * Chat page component with provider
 * @returns {React.ReactElement} The component
 */
const ChatPage = () => (
  <ChatProvider>
    <ChatContainer>
      <SlideDown>
        <ChatHeader>
          <HeaderContent>
            <ChatTitle>ConnectHub Chat</ChatTitle>
          </HeaderContent>
        </ChatHeader>
      </SlideDown>
      <ChatPageContent />
    </ChatContainer>
  </ChatProvider>
);

export default ChatPage;