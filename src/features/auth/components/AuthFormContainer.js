import React from 'react';

const AuthFormContainer = ({ title, children }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">{title}</h2>
        {children}
      </div>
    </div>
  );
};

export default AuthFormContainer; 