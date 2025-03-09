import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { SignedIn, SignedOut, UserButton } from '@clerk/clerk-react';
import styled, { keyframes } from 'styled-components';
import { Flex, Icon, Badge, SlideDown } from '../features/common/components/StyledComponents';

// Animated background
const gradient = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const Background = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: -2;
  background: ${({ theme }) => theme.colors.background};
  overflow: hidden;
`;

const BackgroundBubble = styled.div`
  position: absolute;
  border-radius: 50%;
  background: linear-gradient(
    45deg,
    ${({ theme }) => theme.colors.primary}40,
    ${({ theme }) => theme.colors.secondary}40,
    ${({ theme }) => theme.colors.tertiary}40
  );
  animation: ${({ speed }) => keyframes`
    0% {
      transform: translateY(0) scale(1);
      opacity: ${Math.random() * 0.3 + 0.1};
    }
    100% {
      transform: translateY(-${speed * 50}vh) scale(${Math.random() * 0.5 + 0.8});
      opacity: 0;
    }
  `} ${({ speed }) => speed * 20}s linear infinite;
`;

// Layout components
const AppContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  position: relative;
`;

const Header = styled.header`
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(8px);
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.05);
  position: sticky;
  top: 0;
  z-index: 100;
  padding: ${({ theme }) => theme.space.md};
  transition: ${({ theme }) => theme.transitions.default};
`;

const HeaderContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Logo = styled(Link)`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: ${({ theme }) => theme.fontSizes.xl};
  font-weight: 700;
  color: ${({ theme }) => theme.colors.accent1};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.space.sm};
  
  span {
    background: linear-gradient(
      45deg,
      ${({ theme }) => theme.colors.primary},
      ${({ theme }) => theme.colors.accent1}
    );
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-size: 200% 200%;
    animation: ${gradient} 5s ease infinite;
  }
`;

const Navigation = styled.nav`
  ul {
    display: flex;
    list-style: none;
    margin: 0;
    padding: 0;
    gap: ${({ theme }) => theme.space.md};
    align-items: center;
  }
`;

const NavLink = styled(Link)`
  position: relative;
  color: ${({ theme, active }) => active ? theme.colors.primary : theme.colors.text.primary};
  font-weight: 500;
  padding: ${({ theme }) => `${theme.space.xs} ${theme.space.sm}`};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  transition: ${({ theme }) => theme.transitions.quick};
  
  &::after {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 50%;
    transform: translateX(-50%) scaleX(${({ active }) => active ? 1 : 0});
    width: 80%;
    height: 3px;
    background: linear-gradient(
      to right,
      ${({ theme }) => theme.colors.primary},
      ${({ theme }) => theme.colors.secondary}
    );
    border-radius: ${({ theme }) => theme.borderRadius.full};
    transition: transform 0.3s ease;
  }
  
  &:hover {
    color: ${({ theme }) => theme.colors.primary};
    background: ${({ theme }) => theme.colors.accent3};
    
    &::after {
      transform: translateX(-50%) scaleX(1);
    }
  }
`;

const Main = styled.main`
  flex: 1;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: ${({ theme }) => theme.space.xl};
  position: relative;
`;

const Footer = styled.footer`
  background: linear-gradient(
    to right,
    ${({ theme }) => theme.colors.primary},
    ${({ theme }) => theme.colors.accent1}
  );
  color: ${({ theme }) => theme.colors.text.light};
  padding: ${({ theme }) => theme.space.md};
  text-align: center;
  margin-top: auto;
`;

const FooterContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.space.sm};
`;

const FooterText = styled.p`
  margin: 0;
  font-size: ${({ theme }) => theme.fontSizes.sm};
`;

const UserButtonWrapper = styled.div`
  margin-left: ${({ theme }) => theme.space.md};
  transform: scale(1.1);
  transition: ${({ theme }) => theme.transitions.quick};
  
  &:hover {
    transform: scale(1.2);
  }
`;

/**
 * Main layout component that wraps all pages
 * @returns {React.ReactElement} The layout component
 */
const MainLayout = () => {
  const location = useLocation();
  const [bubbles, setBubbles] = useState([]);

  // Generate random bubbles for background
  useEffect(() => {
    const newBubbles = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      size: Math.random() * 100 + 50,
      left: Math.random() * 100,
      speed: Math.random() * 2 + 1,
      delay: Math.random() * 10,
    }));

    setBubbles(newBubbles);
  }, []);

  return (
    <AppContainer>
      <Background>
        {bubbles.map((bubble) => (
          <BackgroundBubble
            key={bubble.id}
            style={{
              width: `${bubble.size}px`,
              height: `${bubble.size}px`,
              left: `${bubble.left}%`,
              bottom: `-${bubble.size}px`,
              animationDelay: `${bubble.delay}s`,
            }}
            speed={bubble.speed}
          />
        ))}
      </Background>

      <SlideDown>
        <Header>
          <HeaderContent>
            <Logo to="/">
              <span>Connect</span>Hub
            </Logo>

            <Navigation>
              <ul>
                <li>
                  <NavLink to="/" active={location.pathname === '/' ? 1 : 0}>
                    Home
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/about" active={location.pathname === '/about' ? 1 : 0}>
                    About
                  </NavLink>
                </li>

                <SignedIn>
                  <li>
                    <NavLink to="/profile" active={location.pathname === '/profile' ? 1 : 0}>
                      Profile
                    </NavLink>
                  </li>
                  <li>
                    <NavLink to="/chat" active={location.pathname === '/chat' ? 1 : 0}>
                      <Flex align="center">
                        Chat
                        <Badge variant="success" style={{ marginLeft: '6px', width: '8px', height: '8px', padding: 0 }} />
                      </Flex>
                    </NavLink>
                  </li>
                  <li>
                    <UserButtonWrapper>
                      <UserButton afterSignOutUrl="/" />
                    </UserButtonWrapper>
                  </li>
                </SignedIn>

                <SignedOut>
                  <li>
                    <NavLink to="/login" active={location.pathname === '/login' ? 1 : 0}>
                      Login
                    </NavLink>
                  </li>
                  <li>
                    <NavLink to="/signup" active={location.pathname === '/signup' ? 1 : 0}>
                      Sign Up
                    </NavLink>
                  </li>
                </SignedOut>
              </ul>
            </Navigation>
          </HeaderContent>
        </Header>
      </SlideDown>

      <Main>
        <Outlet />
      </Main>

      <Footer>
        <FooterContent>
          <FooterText>
            &copy; {new Date().getFullYear()} ConnectHub • Bringing People Together
          </FooterText>
        </FooterContent>
      </Footer>
    </AppContainer>
  );
};

export default MainLayout;