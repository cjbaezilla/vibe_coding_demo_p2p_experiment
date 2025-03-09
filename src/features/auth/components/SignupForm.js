import React from 'react';
import { SignUp } from '@clerk/clerk-react';
import AuthFormContainer from './AuthFormContainer';

const SignupForm = () => {
  return (
    <AuthFormContainer title="Sign Up">
      <SignUp
        routing="path"
        path="/signup"
        signInUrl="/login"
        redirectUrl="/"
      />
    </AuthFormContainer>
  );
};

export default SignupForm; 