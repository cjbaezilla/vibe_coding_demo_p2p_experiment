import React from 'react';
import SignupForm from './components/SignupForm';

const SignupPage = () => {
  return (
    <div className="container mx-auto px-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Sign Up</h1>
      <SignupForm />
    </div>
  );
};

export default SignupPage; 