import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { supabase } from '../lib/supabase'

export const useAuthStore = defineStore('auth', () => {
  const currentUser = ref(null)
  const session = ref(null)
  const loading = ref(false)
  const error = ref(null)

  const isAuthenticated = computed(() => currentUser.value !== null)

  // Initialize auth state
  async function initialize() {
    loading.value = true
    try {
      // Guard: require Supabase to be configured in production
      if (!supabase) {
        error.value = 'Supabase not configured'
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
        // persist supabase session locally (convenience for quick restores)
        try { localStorage.setItem('chatAppSession', JSON.stringify(currentSession)) } catch (e) { /* ignore */ }
      } else {
        // Attempt silent authentication: if we have a saved session in localStorage,
        // try to restore it with supabase.auth.setSession so the user stays signed in
        // without prompting.
        try {
          const savedSessionRaw = localStorage.getItem('chatAppSession')
          if (savedSessionRaw) {
            const savedSession = JSON.parse(savedSessionRaw)
            // savedSession should contain access_token and refresh_token
            if (savedSession?.access_token || savedSession?.refresh_token) {
              try {
                const { data: restored, error: restoreError } = await supabase.auth.setSession({
                  access_token: savedSession.access_token,
                  refresh_token: savedSession.refresh_token
                })
                if (!restoreError && restored?.session) {
                  session.value = restored.session
                  await fetchUserProfile(restored.session.user.id)
                  // persist the restored session
                  try { localStorage.setItem('chatAppSession', JSON.stringify(restored.session)) } catch (e) { /* ignore */ }
                }
              } catch (e) {
                console.warn('Silent auth failed to set session:', e)
              }
            }
          }
        } catch (e) {
          // ignore JSON parse or storage errors
        }
        // Try restore from localStorage if supabase session wasn't returned
        try {
          const saved = localStorage.getItem('chatAppUser')
          if (saved) {
            currentUser.value = JSON.parse(saved)
          }
          const savedSession = localStorage.getItem('chatAppSession')
          if (savedSession) {
            session.value = JSON.parse(savedSession)
          }
        } catch (e) {
          // ignore JSON errors
        }
      }

      // Listen for auth changes
      supabase.auth.onAuthStateChange(async (_event, newSession) => {
        session.value = newSession

        if (newSession?.user) {
          await fetchUserProfile(newSession.user.id)
          try { localStorage.setItem('chatAppSession', JSON.stringify(newSession)) } catch (e) { /* ignore */ }
        } else {
          currentUser.value = null
          try { localStorage.removeItem('chatAppUser'); localStorage.removeItem('chatAppSession') } catch (e) { /* ignore */ }
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
      if (!supabase) return
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

      // persist a lightweight currentUser for quick UI restore on refresh
      try { localStorage.setItem('chatAppUser', JSON.stringify(currentUser.value)) } catch (e) { /* ignore */ }
    } catch (err) {
      console.error('Profile error:', err)
    }
  }

  // Set or update username for current user
  async function setUsername(username) {
    if (!supabase || !currentUser.value) return { success: false, error: 'Not configured' }
    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ username, updated_at: new Date().toISOString() })
        .eq('id', currentUser.value.id)

      if (updateError) {
        console.error('Username update error:', updateError)
        return { success: false, error: updateError.message }
      }

      // Refresh local profile
      currentUser.value.username = username
      try { localStorage.setItem('chatAppUser', JSON.stringify(currentUser.value)) } catch (e) { /* ignore */ }
      return { success: true }
    } catch (err) {
      console.error('Set username error:', err)
      return { success: false, error: err.message }
    }
  }

  // Create user profile
  async function createProfile(userId) {
    try {
      if (!supabase) return
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
      // fetchUserProfile will persist to localStorage
    } catch (err) {
      console.error('Create profile error:', err)
    }
  }

  // Login with email and password
  async function login(email, password) {
    loading.value = true
    error.value = null

    try {
      if (!supabase) return { success: false, error: 'Supabase not configured' }
      // If Supabase not configured, use mock login
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
      try { localStorage.setItem('chatAppSession', JSON.stringify(data.session)) } catch (e) { /* ignore */ }

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
      if (!supabase) return { success: false, error: 'Supabase not configured' }

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
      if (!supabase) return { success: false, error: 'Supabase not configured' }

      // Update status to offline before signing out
      await updateStatus('offline')

      // Cleanup realtime subscriptions from chat store (if loaded)
      try {
        // lazy import to avoid circular dependency at module load
        const { useChatStore } = await import('./chat')
        const chatStore = useChatStore()
        // Unsubscribe membership listener and per-chat channels
        if (chatStore.unsubscribeFromMemberships) chatStore.unsubscribeFromMemberships()
        if (chatStore.chats) {
          Object.keys(chatStore.chats).forEach(id => {
            try { chatStore.unsubscribeFromChat(id) } catch (e) { /* ignore */ }
          })
        }
      } catch (e) {
        // If chat store isn't available yet, ignore cleanup
        console.warn('Chat store cleanup skipped:', e)
      }

      const { error: signOutError } = await supabase.auth.signOut()

      if (signOutError) {
        error.value = signOutError.message
        return { success: false, error: signOutError.message }
      }

      currentUser.value = null
      session.value = null
      try { localStorage.removeItem('chatAppUser'); localStorage.removeItem('chatAppSession') } catch (e) { /* ignore */ }

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
    if (!currentUser.value || !supabase) return

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

  // Legacy no-op kept for backward compatibility
  function checkAuth() { }

  return {
    currentUser,
    session,
    isAuthenticated,
    loading,
    error,
    initialize,
    login,
    signUp,
    logout,
    updateStatus,
    setUsername,
    checkAuth
  }
})
