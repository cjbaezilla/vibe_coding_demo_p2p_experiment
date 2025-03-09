import React from 'react';
import { SignIn } from '@clerk/clerk-react';
import AuthFormContainer from './AuthFormContainer';

const LoginForm = () => {
  return (
    <AuthFormContainer title="Sign In">
      <SignIn
        routing="path"
        path="/login"
        signUpUrl="/signup"
        redirectUrl="/"
      />
    </AuthFormContainer>
  );
};

export default LoginForm; 