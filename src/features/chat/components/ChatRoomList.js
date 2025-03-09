/**
 * Component for displaying a list of available chat rooms
 */
import React, { useState } from 'react';

/**
 * Chat room list component
 * @param {object} props - Component props
 * @param {Array} props.rooms - List of room objects
 * @param {string} props.selectedRoomId - Currently selected room ID
 * @param {Function} props.onSelectRoom - Callback when room is selected
 * @param {Function} props.onCreateRoom - Callback when create room button is clicked
 * @param {boolean} props.loading - Whether rooms are loading
 * @returns {React.ReactElement} The component
 */
const ChatRoomList = ({
  rooms,
  selectedRoomId,
  onSelectRoom,
  onCreateRoom,
  loading = false
}) => {
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomDescription, setNewRoomDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);

  /**
   * Handle room creation form submission
   * @param {Event} e - Form submit event
   */
  const handleCreateSubmit = (e) => {
    e.preventDefault();

    if (!newRoomName.trim()) {
      return;
    }

    onCreateRoom(newRoomName.trim(), newRoomDescription.trim(), isPrivate);

    // Reset form
    setNewRoomName('');
    setNewRoomDescription('');
    setIsPrivate(false);
    setIsCreateFormOpen(false);
  };

  return (
    <div className="w-full bg-gray-100 dark:bg-gray-900 p-4 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Chat Rooms</h2>
        <button
          onClick={() => setIsCreateFormOpen(!isCreateFormOpen)}
          className="bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium py-1 px-3 rounded
                   focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label={isCreateFormOpen ? 'Cancel' : 'Create New Room'}
        >
          {isCreateFormOpen ? 'Cancel' : 'New Room'}
        </button>
      </div>

      {/* Create Room Form */}
      {isCreateFormOpen && (
        <form onSubmit={handleCreateSubmit} className="mb-4 bg-white dark:bg-gray-800 p-3 rounded shadow-sm">
          <div className="mb-2">
            <label
              htmlFor="roomName"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Room Name *
            </label>
            <input
              id="roomName"
              type="text"
              value={newRoomName}
              onChange={(e) => setNewRoomName(e.target.value)}
              placeholder="Enter room name"
              required
              className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white
                        rounded py-1 px-2 text-sm"
            />
          </div>
          <div className="mb-2">
            <label
              htmlFor="roomDescription"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Description
            </label>
            <input
              id="roomDescription"
              type="text"
              value={newRoomDescription}
              onChange={(e) => setNewRoomDescription(e.target.value)}
              placeholder="Enter description (optional)"
              className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white
                        rounded py-1 px-2 text-sm"
            />
          </div>
          <div className="mb-3 flex items-center">
            <input
              id="isPrivate"
              type="checkbox"
              checked={isPrivate}
              onChange={(e) => setIsPrivate(e.target.checked)}
              className="mr-2"
            />
            <label htmlFor="isPrivate" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Private Room
            </label>
          </div>
          <button
            type="submit"
            disabled={!newRoomName.trim()}
            className="w-full bg-green-500 hover:bg-green-600 text-white text-sm font-medium py-1 px-3
                     rounded focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
          >
            Create Room
          </button>
        </form>
      )}

      {/* Room List */}
      <div className="overflow-y-auto max-h-64">
        {loading ? (
          <div className="text-center py-4 text-gray-500 dark:text-gray-400">
            Loading rooms...
          </div>
        ) : rooms.length === 0 ? (
          <div className="text-center py-4 text-gray-500 dark:text-gray-400">
            No rooms available. Create one!
          </div>
        ) : (
          <ul className="space-y-1">
            {rooms.map((room) => (
              <li key={room.id}>
                <button
                  onClick={() => onSelectRoom(room.id)}
                  className={`w-full text-left px-3 py-2 rounded-md transition ${
                    selectedRoomId === room.id
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200'
                      : 'hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <div className="flex items-center">
                    {room.is_private && (
                      <span className="text-xs bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300
                                       px-1 rounded mr-2">
                        Private
                      </span>
                    )}
                    <span className="font-medium">{room.name}</span>
                  </div>
                  {room.description && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">
                      {room.description}
                    </p>
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ChatRoomList;