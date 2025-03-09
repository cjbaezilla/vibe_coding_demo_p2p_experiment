import styled, { css, keyframes } from 'styled-components';

// Keyframes animations
export const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

export const slideUp = keyframes`
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
`;

export const slideDown = keyframes`
  from { transform: translateY(-20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
`;

export const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

export const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
`;

export const rotate = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

// Container components
export const PageContainer = styled.div`
  padding: ${({ theme }) => theme.space.xl};
  max-width: 1200px;
  margin: 0 auto;
  animation: ${fadeIn} 0.5s ease;
`;

export const Card = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  box-shadow: ${({ theme }) => theme.shadows.md};
  padding: ${({ theme }) => theme.space.lg};
  transition: ${({ theme }) => theme.transitions.default};
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 4px;
    background: linear-gradient(90deg, 
      ${({ theme }) => theme.colors.primary} 0%,
      ${({ theme }) => theme.colors.secondary} 50%,
      ${({ theme }) => theme.colors.tertiary} 100%
    );
  }
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: ${({ theme }) => theme.shadows.lg};
  }
`;

export const Section = styled.section`
  margin: ${({ theme }) => theme.space.xl} 0;
  position: relative;
`;

// Button styles
const ButtonBase = css`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-family: ${({ theme }) => theme.fonts.heading};
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: ${({ theme }) => theme.transitions.default};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  padding: ${({ theme }) => `${theme.space.sm} ${theme.space.lg}`};
  position: relative;
  overflow: hidden;
  
  &:after {
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
  
  &:hover:after {
    transform: translateX(0);
  }
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(255, 107, 107, 0.3);
  }
  
  svg {
    margin-right: ${({ theme }) => theme.space.sm};
  }
`;

export const PrimaryButton = styled.button`
  ${ButtonBase}
  background: linear-gradient(45deg, ${({ theme }) => theme.colors.primary}, ${({ theme }) => theme.colors.accent1});
  color: ${({ theme }) => theme.colors.text.light};
  font-size: ${({ theme }) => theme.fontSizes.md};
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.shadows.md};
  }
  
  &:active {
    transform: translateY(0);
  }
`;

export const SecondaryButton = styled.button`
  ${ButtonBase}
  background: ${({ theme }) => theme.colors.secondary};
  color: ${({ theme }) => theme.colors.text.light};
  font-size: ${({ theme }) => theme.fontSizes.md};
  
  &:hover {
    transform: translateY(-2px);
    background: ${({ theme }) => theme.colors.primary};
  }
`;

export const OutlineButton = styled.button`
  ${ButtonBase}
  background: transparent;
  color: ${({ theme }) => theme.colors.primary};
  border: 2px solid ${({ theme }) => theme.colors.primary};
  
  &:hover {
    background: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.text.light};
  }
`;

// Text components
export const Title = styled.h1`
  font-size: ${({ theme }) => theme.fontSizes['4xl']};
  font-weight: 700;
  margin-bottom: ${({ theme }) => theme.space.lg};
  color: ${({ theme }) => theme.colors.text.primary};
  text-align: ${(props) => props.center ? 'center' : 'left'};
  
  span {
    color: ${({ theme }) => theme.colors.primary};
    position: relative;
    display: inline-block;
    
    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 6px;
      background: ${({ theme }) => theme.colors.tertiary};
      z-index: -1;
      opacity: 0.5;
    }
  }
`;

export const Subtitle = styled.h2`
  font-size: ${({ theme }) => theme.fontSizes['2xl']};
  font-weight: 600;
  margin-bottom: ${({ theme }) => theme.space.md};
  color: ${({ theme }) => theme.colors.text.primary};
  text-align: ${(props) => props.center ? 'center' : 'left'};
`;

export const Text = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.md};
  line-height: 1.6;
  margin-bottom: ${({ theme }) => theme.space.md};
  color: ${({ theme }) => theme.colors.text.secondary};
  max-width: ${(props) => props.narrow ? '70ch' : 'none'};
`;

// Layout components
export const Flex = styled.div`
  display: flex;
  flex-direction: ${(props) => props.direction || 'row'};
  justify-content: ${(props) => props.justify || 'flex-start'};
  align-items: ${(props) => props.align || 'stretch'};
  flex-wrap: ${(props) => props.wrap || 'nowrap'};
  gap: ${(props) => props.gap || '0'};
`;

export const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(${(props) => props.columns || 1}, 1fr);
  gap: ${(props) => props.gap || '1rem'};
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(${(props) => Math.min(props.columns - 1 || 1, 2)}, 1fr);
  }
  
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

// Interactive elements
export const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: ${(props) => props.variant ? props.theme.colors[props.variant] : props.theme.colors.primary};
  color: ${(props) => props.theme.colors.text.light};
  font-size: ${(props) => props.theme.fontSizes.xs};
  font-weight: 600;
  padding: ${(props) => `${props.theme.space.xs} ${props.theme.space.sm}`};
  border-radius: ${(props) => props.theme.borderRadius.full};
  animation: ${pulse} 2s infinite ease-in-out;
`;

export const Avatar = styled.div`
  width: ${(props) => props.size || '40px'};
  height: ${(props) => props.size || '40px'};
  border-radius: ${(props) => props.theme.borderRadius.full};
  background-color: ${(props) => props.theme.colors.accent2};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${(props) => props.theme.colors.text.light};
  font-weight: 600;
  overflow: hidden;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

export const Icon = styled.div`
  width: ${(props) => props.size || '24px'};
  height: ${(props) => props.size || '24px'};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${(props) => props.color ? props.theme.colors[props.color] : props.theme.colors.primary};
  
  svg {
    width: 100%;
    height: 100%;
  }
  
  &.spin {
    animation: ${rotate} 2s linear infinite;
  }
`;

// Form components
export const Input = styled.input`
  width: 100%;
  padding: ${({ theme }) => theme.space.md};
  font-size: ${({ theme }) => theme.fontSizes.md};
  border: 2px solid ${({ theme }) => theme.colors.accent3};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background: ${({ theme }) => theme.colors.surface};
  transition: ${({ theme }) => theme.transitions.quick};
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px rgba(255, 107, 107, 0.2);
  }
  
  &::placeholder {
    color: ${({ theme }) => theme.colors.text.secondary};
    opacity: 0.6;
  }
`;

export const Textarea = styled.textarea`
  width: 100%;
  padding: ${({ theme }) => theme.space.md};
  font-size: ${({ theme }) => theme.fontSizes.md};
  border: 2px solid ${({ theme }) => theme.colors.accent3};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background: ${({ theme }) => theme.colors.surface};
  transition: ${({ theme }) => theme.transitions.quick};
  min-height: 120px;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px rgba(255, 107, 107, 0.2);
  }
`;

// Specialized components
export const Bubble = styled.div`
  position: absolute;
  background: linear-gradient(45deg, 
    ${({ theme }) => theme.colors.primary},
    ${({ theme }) => theme.colors.secondary}
  );
  border-radius: 50%;
  opacity: 0.1;
  z-index: -1;
  animation: ${float} 6s infinite ease-in-out;
  
  &.small {
    width: 60px;
    height: 60px;
  }
  
  &.medium {
    width: 120px;
    height: 120px;
  }
  
  &.large {
    width: 200px;
    height: 200px;
  }
`;

export const GradientText = styled.span`
  background: linear-gradient(45deg, 
    ${({ theme }) => theme.colors.primary},
    ${({ theme }) => theme.colors.accent1}
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  display: inline-block;
`;

export const Divider = styled.hr`
  border: 0;
  height: 2px;
  background: linear-gradient(90deg,
    transparent,
    ${({ theme }) => theme.colors.primary},
    transparent
  );
  margin: ${({ theme }) => theme.space.lg} 0;
  opacity: 0.3;
`;

export const RotatingBadge = styled.div`
  position: absolute;
  top: -15px;
  right: -15px;
  background: ${({ theme }) => theme.colors.tertiary};
  color: ${({ theme }) => theme.colors.text.primary};
  font-weight: 600;
  padding: ${({ theme }) => `${theme.space.xs} ${theme.space.sm}`};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  transform: rotate(15deg);
  font-size: ${({ theme }) => theme.fontSizes.xs};
  box-shadow: ${({ theme }) => theme.shadows.sm};
`;

// Animation helpers
export const FadeIn = styled.div`
  animation: ${fadeIn} ${(props) => props.duration || '0.5s'} ${(props) => props.delay || '0s'} ease both;
`;

export const SlideUp = styled.div`
  animation: ${slideUp} ${(props) => props.duration || '0.5s'} ${(props) => props.delay || '0s'} ease both;
`;

export const SlideDown = styled.div`
  animation: ${slideDown} ${(props) => props.duration || '0.5s'} ${(props) => props.delay || '0s'} ease both;
`;

export const Pulsate = styled.div`
  animation: ${pulse} ${(props) => props.duration || '2s'} infinite ease-in-out;
`;

export const Float = styled.div`
  animation: ${float} ${(props) => props.duration || '6s'} infinite ease-in-out;
`;

export const Spin = styled.div`
  animation: ${rotate} ${(props) => props.duration || '2s'} linear infinite;
`;