import React from 'react';
import AuthPage from './components/AuthPage';
import SignupForm from './components/SignupForm';

/**
 *
 */
const SignupPage = () => (
    <AuthPage title="Sign Up">
      <SignupForm />
    </AuthPage>
  );

export default SignupPage;