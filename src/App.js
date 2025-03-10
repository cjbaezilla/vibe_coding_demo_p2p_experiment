import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
// Import our custom theme provider
import ThemeProvider from './features/common/theme/ThemeProvider';

// Layouts
import MainLayout from './layouts/MainLayout';

// Pages
import HomePage from './features/home/HomePage';
import AboutPage from './features/about/AboutPage';
import LoginPage from './features/auth/LoginPage';
import SignupPage from './features/auth/SignupPage';
import ProfilePage from './features/auth/ProfilePage';
import ChatPage from './features/chat/ChatPage';

// Auth provider
import ClerkProvider from './features/auth/contexts/ClerkProvider';
import ProtectedRoute from './features/auth/components/ProtectedRoute';

/**
 * Main application component that sets up routing and authentication
 * @returns {React.ReactElement} The rendered application
 */
function App() {
  return (
    <ThemeProvider>
      <ClerkProvider>
        <HashRouter>
          <Routes>
            <Route path="/" element={<MainLayout />}>
              <Route index element={<HomePage />} />
              <Route path="about" element={<AboutPage />} />
              <Route path="login" element={<LoginPage />} />
              <Route path="signup" element={<SignupPage />} />
              <Route
                path="profile"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="chat"
                element={
                  <ProtectedRoute>
                    <ChatPage />
                  </ProtectedRoute>
                }
              />
            </Route>
          </Routes>
        </HashRouter>
      </ClerkProvider>
    </ThemeProvider>
  );
}

export default App;
