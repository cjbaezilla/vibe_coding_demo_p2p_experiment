/**
 * Component for displaying a list of available chat rooms
 */
import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import {
  PrimaryButton, SecondaryButton, Input, Text,
  Title, Subtitle, Card, Flex, FadeIn
} from '../../common/components/StyledComponents';

// Animations
const shimmer = keyframes`
  0% {
    background-position: -200px 0;
  }
  100% {
    background-position: 200px 0;
  }
`;

// Styled components for ChatRoomList
const RoomListContainer = styled.div`
  padding: ${({ theme }) => theme.space.lg};
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const RoomListHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.space.lg};
`;

const RoomListTitle = styled(Subtitle)`
  margin-bottom: 0;
  font-weight: 700;
  background: linear-gradient(
    90deg,
    ${({ theme }) => theme.colors.primary},
    ${({ theme }) => theme.colors.accent1}
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const CreateRoomButton = styled(SecondaryButton)`
  background: ${({ theme }) => theme.colors.tertiary};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  padding: ${({ theme }) => `${theme.space.xs} ${theme.space.md}`};
`;

const CreateRoomForm = styled(Card)`
  margin-bottom: ${({ theme }) => theme.space.lg};
  padding: ${({ theme }) => theme.space.md};
  background: linear-gradient(
    135deg,
    ${({ theme }) => theme.colors.surface},
    ${({ theme }) => theme.colors.accent3}
  );
`;

const FormField = styled.div`
  margin-bottom: ${({ theme }) => theme.space.md};
`;

const Label = styled.label`
  display: block;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: ${({ theme }) => theme.space.xs};
`;

const StyledInput = styled(Input)`
  font-size: ${({ theme }) => theme.fontSizes.sm};
`;

const CheckboxContainer = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.space.md};
`;

const Checkbox = styled.input`
  margin-right: ${({ theme }) => theme.space.sm};
  appearance: none;
  width: 18px;
  height: 18px;
  border: 2px solid ${({ theme }) => theme.colors.primary};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  cursor: pointer;
  position: relative;
  transition: ${({ theme }) => theme.transitions.quick};
  
  &:checked {
    background-color: ${({ theme }) => theme.colors.primary};
    border-color: ${({ theme }) => theme.colors.primary};
    
    &:after {
      content: '✓';
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      color: white;
      font-size: 12px;
    }
  }
  
  &:focus {
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primary}40;
    outline: none;
  }
`;

const CheckboxLabel = styled.label`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.text.primary};
  cursor: pointer;
`;

const SubmitButton = styled(PrimaryButton)`
  width: 100%;
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const RoomList = styled.div`
  overflow-y: auto;
  flex-grow: 1;
  
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

const LoadingState = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.space.xl} 0;
  color: ${({ theme }) => theme.colors.text.secondary};
  
  &::before {
    content: '';
    display: block;
    width: 100px;
    height: 20px;
    margin: 0 auto ${({ theme }) => theme.space.md};
    background: linear-gradient(
      90deg,
      ${({ theme }) => theme.colors.accent3},
      ${({ theme }) => theme.colors.accent2},
      ${({ theme }) => theme.colors.accent3}
    );
    background-size: 400px 100%;
    animation: ${shimmer} 1.5s infinite linear;
    border-radius: ${({ theme }) => theme.borderRadius.md};
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.space.xl} 0;
  color: ${({ theme }) => theme.colors.text.secondary};
  
  svg {
    width: 48px;
    height: 48px;
    margin: 0 auto ${({ theme }) => theme.space.md};
    color: ${({ theme }) => theme.colors.tertiary};
  }
`;

const RoomItem = styled.li`
  margin-bottom: ${({ theme }) => theme.space.sm};
`;

const RoomButton = styled.button`
  width: 100%;
  text-align: left;
  padding: ${({ theme }) => theme.space.md};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border: none;
  background: ${({ selected, theme }) =>
    selected
      ? `linear-gradient(45deg, ${theme.colors.primary}20, ${theme.colors.secondary}20)`
      : theme.colors.surface
  };
  box-shadow: ${({ theme, selected }) =>
    selected
      ? `0 4px 12px ${theme.colors.primary}30`
      : theme.shadows.sm
  };
  cursor: pointer;
  transition: ${({ theme }) => theme.transitions.default};
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 4px;
    height: 100%;
    background: ${({ selected, theme }) =>
      selected
        ? `linear-gradient(to bottom, ${theme.colors.primary}, ${theme.colors.secondary})`
        : 'transparent'
    };
    opacity: ${({ selected }) => (selected ? '1' : '0')};
    transition: opacity 0.3s ease;
  }
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.shadows.md};
    
    &::before {
      opacity: 1;
    }
  }
`;

const RoomName = styled.span`
  font-weight: 600;
  color: ${({ selected, theme }) =>
    selected
      ? theme.colors.primary
      : theme.colors.text.primary
  };
  font-size: ${({ theme }) => theme.fontSizes.md};
  display: block;
`;

const RoomDescription = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-top: ${({ theme }) => theme.space.xs};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const PrivateBadge = styled.span`
  display: inline-block;
  font-size: ${({ theme }) => theme.fontSizes.xs};
  background: ${({ theme }) => theme.colors.tertiary};
  color: ${({ theme }) => theme.colors.text.primary};
  padding: ${({ theme }) => `${theme.space.xs} ${theme.space.sm}`};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  margin-right: ${({ theme }) => theme.space.sm};
  font-weight: 600;
  transform: rotate(-2deg);
`;

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
    <RoomListContainer>
      <RoomListHeader>
        <RoomListTitle>Chat Rooms</RoomListTitle>
        <CreateRoomButton onClick={() => setIsCreateFormOpen(!isCreateFormOpen)}>
          {isCreateFormOpen ? 'Cancel' : 'New Room'}
        </CreateRoomButton>
      </RoomListHeader>

      {/* Create Room Form */}
      {isCreateFormOpen && (
        <FadeIn>
          <CreateRoomForm>
            <form onSubmit={handleCreateSubmit}>
              <FormField>
                <Label htmlFor="roomName">Room Name *</Label>
                <StyledInput
                  id="roomName"
                  type="text"
                  value={newRoomName}
                  onChange={(e) => setNewRoomName(e.target.value)}
                  placeholder="Enter a catchy name"
                  required
                />
              </FormField>

              <FormField>
                <Label htmlFor="roomDescription">Description</Label>
                <StyledInput
                  id="roomDescription"
                  type="text"
                  value={newRoomDescription}
                  onChange={(e) => setNewRoomDescription(e.target.value)}
                  placeholder="What's this room about? (optional)"
                />
              </FormField>

              <CheckboxContainer>
                <Checkbox
                  id="isPrivate"
                  type="checkbox"
                  checked={isPrivate}
                  onChange={(e) => setIsPrivate(e.target.checked)}
                />
                <CheckboxLabel htmlFor="isPrivate">
                  Private Room
                </CheckboxLabel>
              </CheckboxContainer>

              <SubmitButton type="submit" disabled={!newRoomName.trim()}>
                Create Room
              </SubmitButton>
            </form>
          </CreateRoomForm>
        </FadeIn>
      )}

      {/* Room List */}
      <RoomList>
        {loading ? (
          <LoadingState>
            Loading rooms...
          </LoadingState>
        ) : rooms.length === 0 ? (
          <EmptyState>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <line x1="8" y1="12" x2="16" y2="12" />
              <line x1="12" y1="8" x2="12" y2="16" />
            </svg>
            <Text>No rooms available yet.<br/>Create one to get started!</Text>
          </EmptyState>
        ) : (
          <ul>
            {rooms.map((room) => (
              <RoomItem key={room.id}>
                <RoomButton
                  onClick={() => onSelectRoom(room.id)}
                  selected={selectedRoomId === room.id}
                >
                  <Flex align="center">
                    {room.is_private && (
                      <PrivateBadge>Private</PrivateBadge>
                    )}
                    <RoomName selected={selectedRoomId === room.id}>
                      {room.name}
                    </RoomName>
                  </Flex>

                  {room.description && (
                    <RoomDescription>
                      {room.description}
                    </RoomDescription>
                  )}
                </RoomButton>
              </RoomItem>
            ))}
          </ul>
        )}
      </RoomList>
    </RoomListContainer>
  );
};

export default ChatRoomList;