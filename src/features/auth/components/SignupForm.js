import React from 'react';
import { SignUp } from '@clerk/clerk-react';
import AuthPage from './AuthPage';

/**
 * Component that renders the Clerk sign-up form
 * @returns {React.ReactElement} The rendered signup form
 */
const SignupForm = () => (
    <AuthPage title="Sign Up" centered containerized>
      <SignUp
        routing="path"
        path="/signup"
        signInUrl="/login"
        redirectUrl="/"
      />
    </AuthPage>
  );

export default SignupForm;