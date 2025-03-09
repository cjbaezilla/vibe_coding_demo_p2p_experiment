/**
 * Component for displaying a list of online users
 */
import React from 'react';
import styled from 'styled-components';
import { isUserOnline } from '../utils/dateUtils';
import { Card, Subtitle, Text } from '../../common/components/StyledComponents';

// Styled components
const UsersListCard = styled(Card)`
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(5px);
  padding: ${({ theme }) => theme.space.md};
  margin-bottom: ${({ theme }) => theme.space.md};
  transition: ${({ theme }) => theme.transitions.default};
  
  &:hover {
    box-shadow: ${({ theme }) => theme.shadows.md};
  }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.space.md};
  
  h2 {
    margin: 0;
    position: relative;
    
    &::after {
      content: '';
      position: absolute;
      bottom: -5px;
      left: 0;
      width: 40px;
      height: 3px;
      background: linear-gradient(
        to right,
        ${({ theme }) => theme.colors.primary},
        ${({ theme }) => theme.colors.secondary}
      );
      border-radius: ${({ theme }) => theme.borderRadius.full};
    }
  }
`;

const OnlineCount = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: ${({ theme }) => theme.colors.success}20;
  color: ${({ theme }) => theme.colors.success};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: 600;
  border-radius: ${({ theme }) => theme.borderRadius.full};
  padding: ${({ theme }) => `${theme.space.xs} ${theme.space.sm}`};
`;

const EmptyStateMessage = styled(Text)`
  text-align: center;
  padding: ${({ theme }) => theme.space.md} 0;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-style: italic;
`;

const UsersList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const UserItem = styled.li`
  display: flex;
  align-items: center;
  padding: ${({ theme }) => theme.space.sm} 0;
  border-bottom: 1px dashed ${({ theme }) => theme.colors.accent3};
  transition: ${({ theme }) => theme.transitions.quick};
  
  &:last-child {
    border-bottom: none;
  }
  
  &:hover {
    transform: translateX(3px);
  }
`;

const UserImageWrapper = styled.div`
  position: relative;
  margin-right: ${({ theme }) => theme.space.sm};
`;

const UserImage = styled.img`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid ${({ theme, online }) =>
    online ? theme.colors.success : theme.colors.accent3};
  transition: ${({ theme }) => theme.transitions.default};
`;

const StatusIndicator = styled.span`
  position: absolute;
  bottom: 0;
  right: 0;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: ${({ theme, online }) =>
    online ? theme.colors.success : theme.colors.accent2};
  border: 2px solid white;
`;

const UserName = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ online, theme }) =>
    online ? theme.colors.text.primary : theme.colors.text.secondary};
  font-weight: ${({ online }) => online ? 600 : 400};
`;

/**
 * Online users list component
 * @param {object} props - Component props
 * @param {Array} props.users - List of user objects with last_seen_at
 * @returns {React.ReactElement} The component
 */
const OnlineUsersList = ({ users = [] }) => {
  if (!users || users.length === 0) {
    return (
      <UsersListCard>
        <CardHeader>
          <Subtitle as="h2">Online Users</Subtitle>
        </CardHeader>
        <EmptyStateMessage>
          No users online
        </EmptyStateMessage>
      </UsersListCard>
    );
  }

  // Filter and sort users
  const sortedUsers = [...users]
    .filter((user) => user.last_seen_at)
    .sort((a, b) => {
      // Sort online users first, then by name
      const aOnline = isUserOnline(a.last_seen_at);
      const bOnline = isUserOnline(b.last_seen_at);

      if (aOnline && !bOnline) {
        return -1;
      }
      if (!aOnline && bOnline) {
        return 1;
      }

      return (a.full_name || '').localeCompare(b.full_name || '');
    });

  // Count online users
  const onlineCount = sortedUsers.filter((user) => isUserOnline(user.last_seen_at)).length;

  return (
    <UsersListCard>
      <CardHeader>
        <Subtitle as="h2">Online Users</Subtitle>
        <OnlineCount>{onlineCount} online</OnlineCount>
      </CardHeader>
      <UsersList>
        {sortedUsers.map((user) => {
          const online = isUserOnline(user.last_seen_at);

          return (
            <UserItem key={user.id}>
              <UserImageWrapper>
                <UserImage
                  src={user.image_url || 'https://via.placeholder.com/32'}
                  alt={user.full_name || 'User'}
                  online={online}
                />
                <StatusIndicator online={online} />
              </UserImageWrapper>
              <UserName online={online}>
                {user.full_name || 'Unknown User'}
              </UserName>
            </UserItem>
          );
        })}
      </UsersList>
    </UsersListCard>
  );
};

export default OnlineUsersList;