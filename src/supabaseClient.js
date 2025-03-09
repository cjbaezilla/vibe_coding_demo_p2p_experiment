/**
 * Supabase client setup
 * Provides both anonymous access client and service role client
 */
import { createClient } from '@supabase/supabase-js'
import { supabaseConfig, validateEnv } from './config/env'

// Validate environment variables
validateEnv()

// Regular client with anonymous access
export const supabase = createClient(supabaseConfig.url, supabaseConfig.anonKey)

// Service role client with admin privileges
// Only use this client for specific operations that require elevated permissions
export const supabaseAdmin = supabaseConfig.serviceKey
  ? createClient(supabaseConfig.url, supabaseConfig.serviceKey)
  : null 