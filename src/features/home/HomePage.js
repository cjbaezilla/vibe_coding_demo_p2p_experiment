import React from 'react';
import { Link } from 'react-router-dom';
import { SignedIn, SignedOut } from '@clerk/clerk-react';
import styled, { keyframes } from 'styled-components';
import {
  Title, Subtitle, Text, PrimaryButton, SecondaryButton,
  Card, Grid, Flex, GradientText, Bubble, SlideUp, FadeIn
} from '../common/components/StyledComponents';
import { ChatIcon, LoginIcon, SignupIcon } from '../common/components/IconComponents';

// Define additional animations
const floatUpDown = keyframes`
  0% { transform: translateY(0); }
  50% { transform: translateY(-15px); }
  100% { transform: translateY(0); }
`;

// Additional styled components specific to HomePage
const HeroSection = styled.section`
  position: relative;
  padding: ${({ theme }) => theme.space['2xl']} 0;
  text-align: center;
  overflow: hidden;
`;

const HeroContent = styled.div`
  position: relative;
  z-index: 1;
  max-width: 800px;
  margin: 0 auto;
`;

const HeroTitle = styled(Title)`
  font-size: ${({ theme }) => theme.fontSizes['5xl']};
  line-height: 1.2;
  margin-bottom: ${({ theme }) => theme.space.lg};
  
  @media (max-width: 768px) {
    font-size: ${({ theme }) => theme.fontSizes['4xl']};
  }
`;

const HeroSubtitle = styled(Subtitle)`
  font-size: ${({ theme }) => theme.fontSizes.xl};
  margin-bottom: ${({ theme }) => theme.space.xl};
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
`;

const FeatureCard = styled(Card)`
  text-align: center;
  padding: ${({ theme }) => theme.space.xl};
  transition: ${({ theme }) => theme.transitions.bounce};
  position: relative;
  
  &:hover {
    transform: translateY(-10px) scale(1.02);
    box-shadow: ${({ theme }) => theme.shadows.lg};
  }
`;

const FeatureIcon = styled.div`
  width: 70px;
  height: 70px;
  margin: 0 auto ${({ theme }) => theme.space.md};
  background: linear-gradient(
    45deg,
    ${({ theme }) => theme.colors.primary}20,
    ${({ theme }) => theme.colors.secondary}20
  );
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme, color }) => theme.colors[color] || theme.colors.primary};
  font-size: 2rem;
  animation: ${floatUpDown} 3s infinite ease-in-out;
`;

const ChatIllustration = styled.div`
  position: relative;
  width: 100%;
  height: 220px;
  margin: ${({ theme }) => theme.space.lg} auto;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const ChatBubble = styled.div`
  background: ${({ incoming, theme }) =>
    incoming
      ? `linear-gradient(45deg, ${theme.colors.accent2}, ${theme.colors.secondary})`
      : `linear-gradient(45deg, ${theme.colors.primary}, ${theme.colors.accent1})`
  };
  color: ${({ theme, incoming }) => incoming ? theme.colors.text.primary : theme.colors.text.light};
  padding: ${({ theme }) => theme.space.md};
  border-radius: ${({ theme, incoming }) =>
    incoming
      ? `${theme.borderRadius.lg} ${theme.borderRadius.lg} ${theme.borderRadius.lg} 0`
      : `${theme.borderRadius.lg} ${theme.borderRadius.lg} 0 ${theme.borderRadius.lg}`
  };
  max-width: 70%;
  position: absolute;
  top: ${({ top }) => top || 'auto'};
  left: ${({ left }) => left || 'auto'};
  right: ${({ right }) => right || 'auto'};
  box-shadow: ${({ theme }) => theme.shadows.md};
  transform: ${({ rotate }) => rotate ? `rotate(${rotate}deg)` : 'none'};
  animation: ${floatUpDown} 3s infinite ease-in-out;
  animation-delay: ${({ delay }) => delay || '0s'};
`;

const StyledLink = styled(Link)`
  text-decoration: none;
  display: inline-block;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.space.md};
  justify-content: center;
  margin-top: ${({ theme }) => theme.space.lg};
  
  @media (max-width: 480px) {
    flex-direction: column;
    align-items: center;
  }
`;

/**
 * Home page component that serves as the landing page for the application
 * @returns {React.ReactElement} The home page component
 */
const HomePage = () => (
  <>
    <SlideUp>
      <HeroSection>
        {/* Decorative bubbles */}
        <Bubble className="large" style={{ top: '20%', left: '5%', animationDelay: '0s' }} />
        <Bubble className="medium" style={{ top: '60%', right: '10%', animationDelay: '1s' }} />
        <Bubble className="small" style={{ top: '30%', right: '20%', animationDelay: '2s' }} />

        <HeroContent>
          <HeroTitle center>
            Welcome to <GradientText>ConnectHub</GradientText>
          </HeroTitle>
          <HeroSubtitle center>
            A colorful space where people connect, share, and build meaningful relationships in real-time
          </HeroSubtitle>

          <SignedIn>
            <FadeIn delay="0.3s">
              <Card>
                <Subtitle center>Jump Back Into The Conversation</Subtitle>
                <Text center>
                  Continue connecting with others through our vibrant real-time chat!
                </Text>

                <ChatIllustration>
                  <ChatBubble incoming top="20px" left="10%" rotate="-5" delay="0.2s">
                    Hey there! How's it going?
                  </ChatBubble>
                  <ChatBubble top="80px" right="10%" rotate="3" delay="0.7s">
                    Just finished a great book! 📚
                  </ChatBubble>
                  <ChatBubble incoming top="150px" left="25%" rotate="0" delay="1.2s">
                    That sounds awesome! Which one?
                  </ChatBubble>
                </ChatIllustration>

                <Flex justify="center">
                  <StyledLink to="/chat">
                    <PrimaryButton>
                      <ChatIcon />
                      Start Chatting Now
                    </PrimaryButton>
                  </StyledLink>
                </Flex>
              </Card>
            </FadeIn>
          </SignedIn>

          <SignedOut>
            <FadeIn delay="0.3s">
              <Card>
                <Subtitle center>Join Our Vibrant Community</Subtitle>
                <Text center>
                  Sign up to access fun features including our colorful real-time chat platform!
                </Text>

                <ChatIllustration>
                  <ChatBubble incoming top="20px" left="10%" rotate="-5" delay="0.2s">
                    Welcome to ConnectHub!
                  </ChatBubble>
                  <ChatBubble top="80px" right="10%" rotate="3" delay="0.7s">
                    So excited to be here! 🎉
                  </ChatBubble>
                  <ChatBubble incoming top="150px" left="25%" rotate="0" delay="1.2s">
                    Let's start connecting!
                  </ChatBubble>
                </ChatIllustration>

                <ButtonGroup>
                  <StyledLink to="/login">
                    <SecondaryButton>
                      <LoginIcon />
                      Log In
                    </SecondaryButton>
                  </StyledLink>

                  <StyledLink to="/signup">
                    <PrimaryButton>
                      <SignupIcon />
                      Sign Up
                    </PrimaryButton>
                  </StyledLink>
                </ButtonGroup>
              </Card>
            </FadeIn>
          </SignedOut>
        </HeroContent>
      </HeroSection>
    </SlideUp>

    <FadeIn delay="0.5s">
      <section>
        <Subtitle center>Experience the Magic of Connection</Subtitle>
        <Grid columns={3} gap="1.5rem">
          <FeatureCard>
            <FeatureIcon color="primary">
              <ChatIcon />
            </FeatureIcon>
            <Subtitle>Vibrant Chat</Subtitle>
            <Text>
              Connect in real-time with a colorful, animated chat experience that makes conversations come alive.
            </Text>
          </FeatureCard>

          <FeatureCard>
            <FeatureIcon color="secondary">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </FeatureIcon>
            <Subtitle>Creative Profiles</Subtitle>
            <Text>
              Express yourself with customizable profiles that showcase your unique personality.
            </Text>
          </FeatureCard>

          <FeatureCard>
            <FeatureIcon color="tertiary">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </FeatureIcon>
            <Subtitle>Safe & Secure</Subtitle>
            <Text>
              Your connections are protected with modern security, so you can focus on what matters: the conversation.
            </Text>
          </FeatureCard>
        </Grid>
      </section>
    </FadeIn>
  </>
);

export default HomePage;