import React from 'react';
import { ClerkProvider as ClerkProviderOriginal } from '@clerk/clerk-react';
import { SupabaseUserProvider } from './SupabaseUserProvider';
import { clerkConfig, validateEnv } from '../../../config/env';

/**
 * Combined auth provider that wraps Clerk and Supabase user providers
 * @param {object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @returns {React.ReactElement} The provider component
 */
const ClerkProvider = ({ children }) => {
  // Validate environment variables
  validateEnv();

  return (
    <ClerkProviderOriginal publishableKey={clerkConfig.publishableKey}>
      <SupabaseUserProvider>
        {children}
      </SupabaseUserProvider>
    </ClerkProviderOriginal>
  );
};

export default ClerkProvider;