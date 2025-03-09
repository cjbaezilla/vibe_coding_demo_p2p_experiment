import React from 'react';
import AuthPage from './components/AuthPage';
import LoginForm from './components/LoginForm';

/**
 * Page component for user login functionality
 * @returns {React.ReactElement} The rendered login page
 */
const LoginPage = () => (
    <AuthPage title="Login">
      <LoginForm />
    </AuthPage>
  );

export default LoginPage;