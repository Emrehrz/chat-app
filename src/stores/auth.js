import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { supabase, isSupabaseConfigured } from '../lib/supabase'

export const useAuthStore = defineStore('auth', () => {
  const currentUser = ref(null)
  const session = ref(null)
  const loading = ref(false)
  const error = ref(null)

  const isAuthenticated = computed(() => currentUser.value !== null)
  const isConfigured = computed(() => isSupabaseConfigured())

  // Initialize auth state
  async function initialize() {
    loading.value = true
    try {
      // Check if Supabase is configured
      if (!isSupabaseConfigured()) {
        console.warn('Supabase is not configured. Using mock mode.')
        checkMockAuth()
        return
      }

      // Get current session
      const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession()

      if (sessionError) {
        console.error('Session error:', sessionError)
        error.value = sessionError.message
        return
      }

      if (currentSession) {
        session.value = currentSession
        await fetchUserProfile(currentSession.user.id)
      }

      // Listen for auth changes
      supabase.auth.onAuthStateChange(async (event, newSession) => {
        console.log('Auth state changed:', event)
        session.value = newSession

        if (newSession?.user) {
          await fetchUserProfile(newSession.user.id)
        } else {
          currentUser.value = null
        }
      })
    } catch (err) {
      console.error('Initialize error:', err)
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  // Fetch user profile from database
  async function fetchUserProfile(userId) {
    try {
      const { data, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (profileError) {
        console.error('Profile fetch error:', profileError)
        // If profile doesn't exist, create it from session user
        if (profileError.code === 'PGRST116') {
          await createProfile(userId)
        }
        return
      }

      currentUser.value = {
        id: data.id,
        username: data.username,
        avatar: data.avatar_url,
        status: data.status,
        joinedAt: data.created_at
      }
    } catch (err) {
      console.error('Profile error:', err)
    }
  }

  // Create user profile
  async function createProfile(userId) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const username = user.user_metadata?.username || user.email?.split('@')[0] || 'User'

      const { data, error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          username,
          avatar_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=random`,
          status: 'online'
        })
        .select()
        .single()

      if (insertError) {
        console.error('Profile creation error:', insertError)
        return
      }

      await fetchUserProfile(userId)
    } catch (err) {
      console.error('Create profile error:', err)
    }
  }

  // Login with email and password
  async function login(email, password) {
    loading.value = true
    error.value = null

    try {
      // If Supabase not configured, use mock login
      if (!isSupabaseConfigured()) {
        loginMock(email.split('@')[0])
        return { success: true }
      }

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (signInError) {
        error.value = signInError.message
        return { success: false, error: signInError.message }
      }

      session.value = data.session
      await fetchUserProfile(data.user.id)

      // Update status to online
      await updateStatus('online')

      return { success: true }
    } catch (err) {
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  // Sign up with email and password
  async function signUp(email, password, username) {
    loading.value = true
    error.value = null

    try {
      if (!isSupabaseConfigured()) {
        return { success: false, error: 'Supabase not configured' }
      }

      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: username || email.split('@')[0]
          }
        }
      })

      if (signUpError) {
        error.value = signUpError.message
        return { success: false, error: signUpError.message }
      }

      return { success: true, data }
    } catch (err) {
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  // Logout
  async function logout() {
    loading.value = true
    error.value = null

    try {
      if (!isSupabaseConfigured()) {
        logoutMock()
        return { success: true }
      }

      // Update status to offline before signing out
      await updateStatus('offline')

      const { error: signOutError } = await supabase.auth.signOut()

      if (signOutError) {
        error.value = signOutError.message
        return { success: false, error: signOutError.message }
      }

      currentUser.value = null
      session.value = null

      return { success: true }
    } catch (err) {
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  // Update user status
  async function updateStatus(status) {
    if (!currentUser.value || !isSupabaseConfigured()) return

    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', currentUser.value.id)

      if (updateError) {
        console.error('Status update error:', updateError)
      } else {
        currentUser.value.status = status
      }
    } catch (err) {
      console.error('Update status error:', err)
    }
  }

  // Mock functions for development without Supabase
  function loginMock(username) {
    const user = {
      id: Date.now().toString(),
      username: username,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=random`,
      status: 'online',
      joinedAt: new Date().toISOString()
    }
    currentUser.value = user
    localStorage.setItem('chatAppUser', JSON.stringify(user))
  }

  function logoutMock() {
    currentUser.value = null
    localStorage.removeItem('chatAppUser')
  }

  function checkMockAuth() {
    const savedUser = localStorage.getItem('chatAppUser')
    if (savedUser) {
      currentUser.value = JSON.parse(savedUser)
    }
  }

  // Legacy function for backward compatibility
  function checkAuth() {
    if (!isSupabaseConfigured()) {
      checkMockAuth()
    }
  }

  return {
    currentUser,
    session,
    isAuthenticated,
    isConfigured,
    loading,
    error,
    initialize,
    login,
    signUp,
    logout,
    updateStatus,
    checkAuth
  }
})
