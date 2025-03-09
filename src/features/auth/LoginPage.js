import React from 'react';
import AuthPage from './components/AuthPage';
import LoginForm from './components/LoginForm';

/**
 *
 */
const LoginPage = () => (
    <AuthPage title="Login">
      <LoginForm />
    </AuthPage>
  );

export default LoginPage;