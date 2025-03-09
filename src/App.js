import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';

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
    <ClerkProvider>
      <BrowserRouter>
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
      </BrowserRouter>
    </ClerkProvider>
  );
}

export default App;
