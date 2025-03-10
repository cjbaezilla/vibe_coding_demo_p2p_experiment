import React from 'react';
import { useUser } from '@clerk/clerk-react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { useSupabaseUserContext } from './contexts/SupabaseUserProvider';
import { formatTimeSince } from '../common/utils/dateUtils';
import {
  Title, Subtitle, Text, Card,
  Section, Grid, Flex, PageContainer, Bubble, GradientText,
  SlideUp, FadeIn, Badge, Divider
} from '../common/components/StyledComponents';
import { LoaderIcon, ChatIcon, SettingsIcon } from '../common/components/IconComponents';

// Additional styled components for ProfilePage
const ProfileHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.space.xl};
  position: relative;
  
  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
  }
`;

const ProfileImage = styled.div`
  width: 120px;
  height: 120px;
  margin-right: ${({ theme }) => theme.space.xl};
  border-radius: 50%;
  overflow: hidden;
  border: 4px solid white;
  box-shadow: ${({ theme }) => theme.shadows.md};
  position: relative;
  background: linear-gradient(45deg, 
    ${({ theme }) => theme.colors.primary},
    ${({ theme }) => theme.colors.accent1}
  );
  
  @media (max-width: 768px) {
    margin: 0 auto ${({ theme }) => theme.space.md};
  }
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  &::after {
    content: '';
    position: absolute;
    top: -6px;
    left: -6px;
    right: -6px;
    bottom: -6px;
    border-radius: 50%;
    background: linear-gradient(45deg, 
      ${({ theme }) => theme.colors.primary},
      ${({ theme }) => theme.colors.secondary},
      ${({ theme }) => theme.colors.tertiary},
      ${({ theme }) => theme.colors.accent1}
    );
    z-index: -1;
    animation: rotate 8s linear infinite;
  }
`;

const ProfileInfo = styled.div`
  flex: 1;
`;

const UserName = styled.h2`
  font-size: ${({ theme }) => theme.fontSizes['3xl']};
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: ${({ theme }) => theme.space.sm};
`;

const UserEmail = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.lg};
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-bottom: ${({ theme }) => theme.space.md};
`;

const QuickActionsSection = styled(Section)`
  margin-bottom: ${({ theme }) => theme.space.xl};
`;

const ActionButton = styled(Link)`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.space.md};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  font-weight: 600;
  transition: ${({ theme }) => theme.transitions.bounce};
  text-decoration: none;
  position: relative;
  overflow: hidden;
  
  svg {
    margin-right: ${({ theme }) => theme.space.sm};
    width: 24px;
    height: 24px;
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(255, 255, 255, 0.1);
    transform: translateX(-100%);
    transition: transform 0.3s ease;
  }
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: ${({ theme }) => theme.shadows.md};
    
    &::before {
      transform: translateX(0);
    }
  }
`;

const ChatButton = styled(ActionButton)`
  background: linear-gradient(45deg, 
    ${({ theme }) => theme.colors.primary}, 
    ${({ theme }) => theme.colors.accent1}
  );
  color: white;
`;

const SettingsButton = styled(ActionButton)`
  background: linear-gradient(45deg, 
    ${({ theme }) => theme.colors.tertiary}, 
    ${({ theme }) => theme.colors.secondary}
  );
  color: ${({ theme }) => theme.colors.text.primary};
`;

const InfoCard = styled(Card)`
  height: 100%;
  
  &:hover {
    transform: translateY(-5px);
  }
`;

const InfoCardTitle = styled(Subtitle)`
  position: relative;
  display: inline-block;
  margin-bottom: ${({ theme }) => theme.space.md};
  padding-bottom: ${({ theme }) => theme.space.sm};
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 3px;
    background: linear-gradient(
      to right,
      ${({ theme }) => theme.colors.primary},
      ${({ theme }) => theme.colors.secondary}
    );
    border-radius: ${({ theme }) => theme.borderRadius.full};
  }
`;

const InfoRow = styled.div`
  display: flex;
  padding: ${({ theme }) => theme.space.sm} 0;
  border-bottom: 1px dashed ${({ theme }) => theme.colors.accent3};
  
  &:last-child {
    border-bottom: none;
  }
`;

const InfoLabel = styled.span`
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-right: ${({ theme }) => theme.space.sm};
  min-width: 120px;
`;

const InfoValue = styled.span`
  color: ${({ theme }) => theme.colors.text.secondary};
  flex: 1;
`;

const AlertBox = styled.div`
  padding: ${({ theme }) => theme.space.md};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  margin-bottom: ${({ theme }) => theme.space.md};
  
  &.error {
    background-color: ${({ theme }) => theme.colors.error}20;
    color: ${({ theme }) => theme.colors.error};
  }
  
  &.warning {
    background-color: ${({ theme }) => theme.colors.warning}20;
    color: ${({ theme }) => theme.colors.warning};
  }
`;

const AlertTitle = styled.p`
  font-weight: 600;
  margin-bottom: ${({ theme }) => theme.space.xs};
`;

const AlertMessage = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.sm};
`;

const FooterText = styled(Text)`
  text-align: center;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  margin-top: ${({ theme }) => theme.space.xl};
`;

/**
 * Component that displays user profile information
 * Shows data from both Clerk and Supabase
 * @returns {React.ReactElement} The rendered profile page
 */
const ProfilePage = () => {
  const { user } = useUser();
  const {
    supabaseUser,
    isLoading: isSupabaseLoading,
    error: supabaseError
  } = useSupabaseUserContext();

  if (!user) {
    return (
      <PageContainer>
        <Flex align="center" justify="center" style={{ height: '300px' }}>
          <div style={{ textAlign: 'center' }}>
            <div className="spin" style={{ marginBottom: '1rem' }}>
              <LoaderIcon />
            </div>
            <Text>Loading user data...</Text>
          </div>
        </Flex>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <SlideUp>
        <Title center>Your <GradientText>Profile</GradientText></Title>
      </SlideUp>

      <FadeIn>
        <Card>
          {/* Background bubbles */}
          <Bubble className="medium" style={{ top: '20%', right: '10%', opacity: '0.05' }} />
          <Bubble className="small" style={{ bottom: '20%', left: '5%', opacity: '0.05' }} />

          <ProfileHeader>
            <ProfileImage>
              {user.imageUrl && (
                <img
                  src={user.imageUrl}
                  alt="Profile"
                />
              )}
            </ProfileImage>
            <ProfileInfo>
              <UserName>{user.fullName || 'User'}</UserName>
              <UserEmail>{user.primaryEmailAddress?.emailAddress}</UserEmail>
              <Badge variant="success">Active Member</Badge>
            </ProfileInfo>
          </ProfileHeader>

          {/* Quick Actions Section */}
          <QuickActionsSection>
            <InfoCardTitle>Quick Actions</InfoCardTitle>
            <Grid columns={2} gap="1rem">
              <ChatButton to="/chat">
                <ChatIcon />
                Real-time Chat
                <Badge variant="success" style={{ marginLeft: '.5rem', width: '10px', height: '10px', padding: 0 }} />
              </ChatButton>

              <SettingsButton as="button" onClick={() => {/* Additional action placeholder */}}>
                <SettingsIcon />
                Settings
              </SettingsButton>
            </Grid>
          </QuickActionsSection>

          <Divider />

          <Grid columns={2} gap="1.5rem">
            {/* Clerk Account Information */}
            <InfoCard>
              <InfoCardTitle>Clerk Account</InfoCardTitle>
              <InfoRow>
                <InfoLabel>ID:</InfoLabel>
                <InfoValue>{user.id}</InfoValue>
              </InfoRow>
              <InfoRow>
                <InfoLabel>Email:</InfoLabel>
                <InfoValue>{user.primaryEmailAddress?.emailAddress}</InfoValue>
              </InfoRow>
              <InfoRow>
                <InfoLabel>Member since:</InfoLabel>
                <InfoValue>{formatTimeSince(user.createdAt)}</InfoValue>
              </InfoRow>
            </InfoCard>

            {/* Supabase User Information */}
            <InfoCard>
              <InfoCardTitle>Supabase Data</InfoCardTitle>
              {supabaseError ? (
                <AlertBox className="error">
                  <AlertTitle>Error connecting to database</AlertTitle>
                  <AlertMessage>Please try again later or contact support</AlertMessage>
                </AlertBox>
              ) : isSupabaseLoading ? (
                <Flex align="center" justify="center" style={{ padding: '20px' }}>
                  <div className="spin">
                    <LoaderIcon />
                  </div>
                </Flex>
              ) : supabaseUser ? (
                <>
                  <InfoRow>
                    <InfoLabel>ID:</InfoLabel>
                    <InfoValue>{supabaseUser.id}</InfoValue>
                  </InfoRow>
                  <InfoRow>
                    <InfoLabel>Clerk ID:</InfoLabel>
                    <InfoValue>{supabaseUser.clerk_id}</InfoValue>
                  </InfoRow>
                  <InfoRow>
                    <InfoLabel>Created at:</InfoLabel>
                    <InfoValue>{formatTimeSince(supabaseUser.created_at)}</InfoValue>
                  </InfoRow>
                  <InfoRow>
                    <InfoLabel>Last updated:</InfoLabel>
                    <InfoValue>{formatTimeSince(supabaseUser.updated_at)}</InfoValue>
                  </InfoRow>
                </>
              ) : (
                <AlertBox className="warning">
                  <AlertTitle>Your Supabase user record hasn't been created yet.</AlertTitle>
                  <AlertMessage>This may happen the first time you log in.</AlertMessage>
                </AlertBox>
              )}
            </InfoCard>
          </Grid>
        </Card>
      </FadeIn>

      <FooterText>
        Your account is synchronized between Clerk (authentication) and Supabase (data storage)
      </FooterText>
    </PageContainer>
  );
};

export default ProfilePage;