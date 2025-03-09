import React from 'react';
import { ClerkProvider as ClerkProviderOriginal } from '@clerk/clerk-react';

const ClerkProvider = ({ children }) => {
  const publishableKey = process.env.REACT_APP_CLERK_PUBLISHABLE_KEY;
  
  if (!publishableKey) {
    throw new Error('Missing Clerk publishable key');
  }

  return (
    <ClerkProviderOriginal publishableKey={publishableKey}>
      {children}
    </ClerkProviderOriginal>
  );
};

export default ClerkProvider; 