import React from 'react';

/**
 *
 * @param root0
 * @param root0.title
 * @param root0.children
 */
const AuthFormContainer = ({ title, children }) => (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">{title}</h2>
        {children}
      </div>
    </div>
  );

export default AuthFormContainer;