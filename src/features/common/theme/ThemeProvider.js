import React from 'react';
import { ThemeProvider as StyledThemeProvider, createGlobalStyle } from 'styled-components';

// Playful, vibrant color palette
export const theme = {
  colors: {
    primary: '#FF6B6B', // Coral pink
    secondary: '#4ECDC4', // Turquoise
    tertiary: '#FFD166', // Mustard yellow
    accent1: '#6A0572', // Deep purple
    accent2: '#AB83A1', // Lavender
    accent3: '#F8EDEB', // Soft peach
    success: '#06D6A0', // Mint green
    warning: '#FFB703', // Amber
    error: '#EF476F', // Raspberry
    background: '#F9F7F3', // Off-white
    surface: '#FFFFFF', // White
    text: {
      primary: '#2E294E', // Dark purple
      secondary: '#4F4F4F', // Dark gray
      light: '#FFFFFF', // White
      accent: '#FF6B6B', // Coral pink
    },
  },
  fonts: {
    heading: "'Poppins', sans-serif",
    body: "'Quicksand', sans-serif",
  },
  fontSizes: {
    xs: '0.75rem',
    sm: '0.875rem',
    md: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem',
    '5xl': '3rem',
  },
  space: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '4rem',
    '3xl': '6rem',
  },
  borderRadius: {
    sm: '0.25rem',
    md: '0.5rem',
    lg: '1rem',
    full: '9999px',
  },
  shadows: {
    sm: '0 1px 3px rgba(0, 0, 0, 0.12)',
    md: '0 4px 6px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px rgba(0, 0, 0, 0.07)',
    xl: '0 20px 25px rgba(0, 0, 0, 0.05)',
  },
  transitions: {
    quick: 'all 0.2s ease',
    default: 'all 0.3s ease',
    slow: 'all 0.5s ease',
    bounce: 'all 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },
  animations: {
    fadeIn: '@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }',
    bounceIn: '@keyframes bounceIn { 0% { transform: scale(0.8); opacity: 0; } 80% { transform: scale(1.1); } 100% { transform: scale(1); opacity: 1; } }',
    pulse: '@keyframes pulse { 0% { transform: scale(1); } 50% { transform: scale(1.05); } 100% { transform: scale(1); } }',
    float: '@keyframes float { 0% { transform: translateY(0px); } 50% { transform: translateY(-10px); } 100% { transform: translateY(0px); } }',
  },
};

// Global styles
const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&family=Quicksand:wght@400;500;600&display=swap');
  
  *, *::before, *::after {
    box-sizing: border-box;
  }
  
  html, body {
    margin: 0;
    padding: 0;
    background-color: ${(props) => props.theme.colors.background};
    color: ${(props) => props.theme.colors.text.primary};
    font-family: ${(props) => props.theme.fonts.body};
    transition: ${(props) => props.theme.transitions.default};
    overflow-x: hidden;
  }
  
  h1, h2, h3, h4, h5, h6 {
    font-family: ${(props) => props.theme.fonts.heading};
    margin-top: 0;
    color: ${(props) => props.theme.colors.text.primary};
  }
  
  a {
    text-decoration: none;
    color: ${(props) => props.theme.colors.primary};
    transition: ${(props) => props.theme.transitions.quick};
    
    &:hover {
      color: ${(props) => props.theme.colors.accent1};
    }
  }
  
  button {
    font-family: ${(props) => props.theme.fonts.body};
    cursor: pointer;
  }
  
  /* Custom scrollbar */
  ::-webkit-scrollbar {
    width: 8px;
  }
  
  ::-webkit-scrollbar-track {
    background: ${(props) => props.theme.colors.accent3};
  }
  
  ::-webkit-scrollbar-thumb {
    background-color: ${(props) => props.theme.colors.accent2};
    border-radius: 20px;
  }
`;

/**
 * ThemeProvider component that provides theme context to all child components
 * @param {object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @returns {React.ReactElement} The themed application
 */
const ThemeProvider = ({ children }) => (
  <StyledThemeProvider theme={theme}>
    <GlobalStyle />
    {children}
  </StyledThemeProvider>
);

export default ThemeProvider;