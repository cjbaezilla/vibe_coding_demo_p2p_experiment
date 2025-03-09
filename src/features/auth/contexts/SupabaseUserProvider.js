/**
 * Context provider for Supabase user
 * This provides the Supabase user state throughout the application
 */
import React, { createContext, useContext } from 'react';
import { useSupabaseUser } from '../hooks/useSupabaseUser';

// Create context
const SupabaseUserContext = createContext(null);

/**
 * Provider component that wraps app and provides Supabase user context
 * @param {object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @returns {React.ReactElement} The provider component
 */
export const SupabaseUserProvider = ({ children }) => {
  const supabaseUserState = useSupabaseUser();

  return (
    <SupabaseUserContext.Provider value={supabaseUserState}>
      {children}
    </SupabaseUserContext.Provider>
  );
};

/**
 * Hook to use the Supabase user context
 * @returns {object} Supabase user context value containing supabaseUser, isLoading, error and refetch
 */
export const useSupabaseUserContext = () => {
  const context = useContext(SupabaseUserContext);

  if (context === null) {
    throw new Error('useSupabaseUserContext must be used within a SupabaseUserProvider');
  }

  return context;
};