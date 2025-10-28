import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

/**
 * Check if Supabase is properly configured
 * @returns {boolean} True if Supabase credentials are available
 */
export function isSupabaseConfigured() {
  return !!(supabaseUrl && supabaseAnonKey && supabaseUrl !== 'your_supabase_project_url')
}

// Only create Supabase client if credentials are provided
// In mock mode (no credentials), supabase will be null
export const supabase = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    },
    realtime: {
      params: {
        eventsPerSecond: 10
      }
    }
  })
  : null

// Log current mode
if (isSupabaseConfigured()) {
  console.log('✅ Supabase bağlantısı aktif')
} else {
  console.log('📦 Mock mod aktif - Dummy data kullanılıyor')
}

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
