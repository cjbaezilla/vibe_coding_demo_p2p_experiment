/**
 * Environment variables configuration
 * Centralizes all environment variables and provides validation and fallbacks
 */

/**
 * Clerk authentication configuration
 */
export const clerkConfig = {
  publishableKey: process.env.REACT_APP_CLERK_PUBLISHABLE_KEY,
};

/**
 * Supabase configuration
 */
export const supabaseConfig = {
  url: process.env.REACT_APP_SUPABASE_URL,
  anonKey: process.env.REACT_APP_SUPABASE_ANON_KEY,
  serviceKey: process.env.REACT_APP_SUPABASE_SERVICE_KEY,
};

/**
 * Validates that required environment variables are present
 * @throws {Error} If any required environment variables are missing
 */
export const validateEnv = () => {
  const missingVars = [];

  if (!clerkConfig.publishableKey) {
    missingVars.push('REACT_APP_CLERK_PUBLISHABLE_KEY');
  }

  if (!supabaseConfig.url) {
    missingVars.push('REACT_APP_SUPABASE_URL');
  }

  if (!supabaseConfig.anonKey) {
    missingVars.push('REACT_APP_SUPABASE_ANON_KEY');
  }

  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }
}; 