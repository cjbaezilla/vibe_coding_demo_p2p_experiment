import React from 'react';
import LoginForm from './components/LoginForm';

const LoginPage = () => {
  return (
    <div className="container mx-auto px-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Login</h1>
      <LoginForm />
    </div>
  );
};

export default LoginPage; 