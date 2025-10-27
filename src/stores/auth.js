import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', () => {
  const currentUser = ref(null)
  const isAuthenticated = computed(() => currentUser.value !== null)

  function login(username) {
    const user = {
      id: Date.now().toString(),
      username: username,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=random`,
      joinedAt: new Date().toISOString()
    }
    currentUser.value = user
    localStorage.setItem('chatAppUser', JSON.stringify(user))
  }

  function logout() {
    currentUser.value = null
    localStorage.removeItem('chatAppUser')
  }

  function checkAuth() {
    const savedUser = localStorage.getItem('chatAppUser')
    if (savedUser) {
      currentUser.value = JSON.parse(savedUser)
    }
  }

  return { currentUser, isAuthenticated, login, logout, checkAuth }
})
