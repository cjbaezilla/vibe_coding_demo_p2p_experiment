import React from 'react';
import { SignIn } from '@clerk/clerk-react';
import AuthPage from './AuthPage';

/**
 * Component that renders the Clerk sign-in form
 * @returns {React.ReactElement} The rendered login form
 */
const LoginForm = () => (
    <AuthPage title="Sign In" centered containerized>
      <SignIn
        routing="path"
        path="/login"
        signUpUrl="/signup"
        redirectUrl="/"
      />
    </AuthPage>
  );

export default LoginForm;