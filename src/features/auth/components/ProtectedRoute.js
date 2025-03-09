import React from 'react';
import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react';

/**
 * Component that restricts access to authenticated users only
 * @param {object} props - Component props
 * @param {React.ReactNode} props.children - The content to be protected behind authentication
 * @returns {React.ReactElement} The protected route component
 */
const ProtectedRoute = ({ children }) => (
    <>
      <SignedIn>{children}</SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );

export default ProtectedRoute;