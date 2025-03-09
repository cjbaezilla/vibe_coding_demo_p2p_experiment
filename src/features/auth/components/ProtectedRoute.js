import React from 'react';
import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react';

/**
 *
 * @param root0
 * @param root0.children
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