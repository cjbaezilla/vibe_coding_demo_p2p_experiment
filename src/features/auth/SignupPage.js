import React from 'react';
import AuthPage from './components/AuthPage';
import SignupForm from './components/SignupForm';

/**
 * Page component for user registration functionality
 * @returns {React.ReactElement} The rendered signup page
 */
const SignupPage = () => (
    <AuthPage title="Sign Up">
      <SignupForm />
    </AuthPage>
  );

export default SignupPage;