import React from 'react';

/**
 *
 * @param root0
 * @param root0.title
 * @param root0.children
 */
const AuthPage = ({ title, children }) => (
    <div className="container mx-auto px-4">
      <h1 className="text-3xl font-bold mb-6 text-center">{title}</h1>
      {children}
    </div>
  );

export default AuthPage;