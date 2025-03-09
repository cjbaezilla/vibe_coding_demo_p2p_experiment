import React from 'react';

const AuthPage = ({ title, children }) => {
  return (
    <div className="container mx-auto px-4">
      <h1 className="text-3xl font-bold mb-6 text-center">{title}</h1>
      {children}
    </div>
  );
};

export default AuthPage; 