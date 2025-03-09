/**
 * Main chat page component that integrates all chat functionality
 */
import React from 'react';
import { ChatProvider, useChatContext } from './contexts/ChatProvider';
import ChatRoomList from './components/ChatRoomList';
import ChatRoom from './components/ChatRoom';

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
    <div className="flex h-full">
      {/* Sidebar with room list */}
      <div className="w-80 p-4 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-y-auto">
        <ChatRoomList
          rooms={rooms}
          selectedRoomId={selectedRoomId}
          onSelectRoom={handleSelectRoom}
          onCreateRoom={createRoom}
          loading={loading}
        />
      </div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col">
        <ChatRoom roomId={selectedRoomId} />
      </div>
    </div>
  );
};

/**
 * Chat page component with provider
 * @returns {React.ReactElement} The component
 */
const ChatPage = () => (
    <ChatProvider>
      <div className="h-full flex flex-col">
        <header className="bg-blue-600 text-white p-4 shadow-md">
          <h1 className="text-2xl font-bold">Real-time Chat</h1>
        </header>

        <main className="flex-1 overflow-hidden">
          <ChatPageContent />
        </main>
      </div>
    </ChatProvider>
  );

export default ChatPage;