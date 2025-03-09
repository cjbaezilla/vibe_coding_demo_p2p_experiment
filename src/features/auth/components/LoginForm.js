import React from 'react';
import { SignIn } from '@clerk/clerk-react';
import AuthFormContainer from './AuthFormContainer';

/**
 *
 */
const LoginForm = () => (
    <AuthFormContainer title="Sign In">
      <SignIn
        routing="path"
        path="/login"
        signUpUrl="/signup"
        redirectUrl="/"
      />
    </AuthFormContainer>
  );

export default LoginForm;