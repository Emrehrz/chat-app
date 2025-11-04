import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
// Optional explicit realtime URL (ws:// or wss://). Useful for self-hosted Supabase.
const supabaseRealtimeUrl = import.meta.env.VITE_SUPABASE_REALTIME_URL

/**
 * Check if Supabase is properly configured
 * @returns {boolean} True if Supabase credentials are available
 */
export function isSupabaseConfigured() {
  return !!(supabaseUrl && supabaseAnonKey && supabaseUrl !== 'your_supabase_project_url')
}

// Only create Supabase client if credentials are provided. Otherwise, supabase will be null.
export const supabase = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    },
    // Configure realtime. If a dedicated realtime URL is provided (common in
    // self-hosted setups), pass it to the client. Otherwise the client will
    // derive the realtime URL from the main `supabaseUrl`.
    realtime: supabaseRealtimeUrl ? {
      url: supabaseRealtimeUrl,
      params: {
        eventsPerSecond: 10
      }
    } : {
      params: {
        eventsPerSecond: 10
      }
    }
  })
  : null

// Production: avoid noisy console logs regarding mode

// Helper to get current user (only works when Supabase is configured)
export const getCurrentUser = async () => {
  if (!supabase) {
    return { user: null, error: new Error('Supabase not configured') }
  }
  const { data: { user }, error } = await supabase.auth.getUser()
  return { user, error }
}

// Helper to sign out (only works when Supabase is configured)
export const signOut = async () => {
  if (!supabase) {
    return { error: new Error('Supabase not configured') }
  }
  const { error } = await supabase.auth.signOut()
  return { error }
}
