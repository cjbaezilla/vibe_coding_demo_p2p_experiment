import React from 'react';
import AuthPage from './components/AuthPage';
import LoginForm from './components/LoginForm';

const LoginPage = () => {
  return (
    <AuthPage title="Login">
      <LoginForm />
    </AuthPage>
  );
};

export default LoginPage; 