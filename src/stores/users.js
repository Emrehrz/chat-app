import { ref } from 'vue'
import { defineStore } from 'pinia'
import { supabase, isSupabaseConfigured } from '../lib/supabase'

export const useUsersStore = defineStore('users', () => {
  const users = ref([])
  const loading = ref(false)
  const error = ref(null)

  // Mock users for development
  const mockUsers = [
    {
      id: '1',
      username: 'Ahmet',
      avatar_url: 'https://ui-avatars.com/api/?name=Ahmet&background=4A90E2',
      status: 'online'
    },
    {
      id: '2',
      username: 'Ayşe',
      avatar_url: 'https://ui-avatars.com/api/?name=Ayşe&background=E94A90',
      status: 'online'
    },
    {
      id: '3',
      username: 'Mehmet',
      avatar_url: 'https://ui-avatars.com/api/?name=Mehmet&background=4AE990',
      status: 'offline'
    },
    {
      id: '4',
      username: 'Zeynep',
      avatar_url: 'https://ui-avatars.com/api/?name=Zeynep&background=E9904A',
      status: 'online'
    }
  ]

  // Fetch all users from Supabase
  // Accept optional currentUserId to filter out users that already have a direct
  // chat with the current user (used for the "start new chat" list).
  async function fetchUsers(currentUserId = null) {
    loading.value = true
    error.value = null

    try {
      // If Supabase not configured, use mock users
      if (!isSupabaseConfigured()) {
        users.value = mockUsers.map(u => ({
          id: u.id,
          username: u.username,
          avatar: u.avatar_url,
          status: u.status
        }))
        return
      }

      let data, fetchError
      if (currentUserId) {
        // Call RPC that returns available users for new direct chats
        // Note: RPC parameter name is `p_current_user` to avoid reserved words.
        const rpc = await supabase.rpc('get_available_users_for_new_chat', { p_current_user: currentUserId })
        data = rpc.data
        fetchError = rpc.error
      } else {
        const res = await supabase
          .from('profiles')
          .select('*')
          .order('username')
        data = res.data
        fetchError = res.error
      }

      if (fetchError) {
        console.error('Users fetch error:', fetchError)
        error.value = fetchError.message
        // Fallback to mock users on error
        users.value = mockUsers.map(u => ({
          id: u.id,
          username: u.username,
          avatar: u.avatar_url,
          status: u.status
        }))
        return
      }

      users.value = data.map(user => ({
        id: user.id,
        username: user.username,
        avatar: user.avatar_url,
        status: user.status || 'offline'
      }))
    } catch (err) {
      console.error('Fetch users error:', err)
      error.value = err.message
      // Fallback to mock users
      users.value = mockUsers.map(u => ({
        id: u.id,
        username: u.username,
        avatar: u.avatar_url,
        status: u.status
      }))
    } finally {
      loading.value = false
    }
  }

  // Subscribe to real-time user status updates
  function subscribeToUserUpdates() {
    if (!isSupabaseConfigured()) return null

    const channel = supabase
      .channel('profiles-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles'
        },
        (payload) => {
          console.log('Profile change:', payload)

          if (payload.eventType === 'INSERT') {
            const newUser = {
              id: payload.new.id,
              username: payload.new.username,
              avatar: payload.new.avatar_url,
              status: payload.new.status
            }
            users.value.push(newUser)
          } else if (payload.eventType === 'UPDATE') {
            const index = users.value.findIndex(u => u.id === payload.new.id)
            if (index !== -1) {
              users.value[index] = {
                id: payload.new.id,
                username: payload.new.username,
                avatar: payload.new.avatar_url,
                status: payload.new.status
              }
            }
          } else if (payload.eventType === 'DELETE') {
            users.value = users.value.filter(u => u.id !== payload.old.id)
          }
        }
      )
      .subscribe()

    return channel
  }

  function getUserById(id) {
    return users.value.find(user => user.id === id)
  }

  function getUserByUsername(username) {
    return users.value.find(user => user.username.toLowerCase() === username.toLowerCase())
  }

  return {
    users,
    loading,
    error,
    fetchUsers,
    subscribeToUserUpdates,
    getUserById,
    getUserByUsername
  }
})
