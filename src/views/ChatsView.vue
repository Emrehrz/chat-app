<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useChatStore } from '../stores/chat'
import { useThemeStore } from '../stores/theme'
import { useUsersStore } from '../stores/users'

const router = useRouter()
const authStore = useAuthStore()
const chatStore = useChatStore()
const themeStore = useThemeStore()
const usersStore = useUsersStore()

onMounted(async () => {
  if (authStore.currentUser?.id) {
    chatStore.initializeChats(authStore.currentUser.id)
    await usersStore.fetchUsers(authStore.currentUser.id)
    usersStore.subscribeToUserUpdates()
  }
})

const chats = computed(() => chatStore.chatList)

// Grup ve ikili sohbetleri ayır
const groupChats = computed(() => chats.value.filter(chat => chat.isGroup))
const directChats = computed(() => chats.value.filter(chat => !chat.isGroup))

// Sohbet açılmamış kullanıcılar
const availableUsers = computed(() => {
  const chatUserIds = directChats.value.map(chat => chat.userId)
  return usersStore.users.filter(user =>
    user.id !== authStore.currentUser.id && !chatUserIds.includes(user.id)
  )
})

const formatTime = (timestamp) => {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now - date

  if (diff < 86400000) { // Less than 24 hours
    return date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
  } else if (diff < 604800000) { // Less than 7 days
    const days = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi']
    return days[date.getDay()]
  } else {
    return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })
  }
}

const openChat = (chatId) => {
  router.push(`/chat/${chatId}`)
}

const startNewChat = async (user) => {
  const chatId = await chatStore.createOrGetChat(
    user.id,
    user.username,
    user.avatar,
    authStore.currentUser.id
  )
  if (chatId) {
    router.push(`/chat/${chatId}`)
  }
}

const handleLogout = async () => {
  await authStore.logout()
  router.push('/login')
}

const toggleTheme = () => {
  themeStore.toggleTheme()
}
</script>

<template>
  <div class="container chat-container">
    <!-- Header -->
    <div class="chat-header flex items-center justify-between">
      <div class="flex flex-col gap-sm">
        <h1 class="text-xl font-bold">Sohbetler</h1>
        <div class="flex items-center gap-sm">
          <img :src="authStore.currentUser?.avatar" :alt="authStore.currentUser?.username" class="avatar avatar-md" />
          <span class="font-medium">{{ authStore.currentUser?.username }}</span>
        </div>
      </div>
      <div class="flex items-center gap-sm">
        <button @click="toggleTheme" class="btn-icon text-white"
          :title="themeStore.theme === 'dark' ? 'Açık Tema' : 'Koyu Tema'">
          <!-- Show sun icon in dark mode (to switch to light) -->
          <svg v-if="themeStore.theme === 'dark'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22"
            height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
            stroke-linejoin="round">
            <path
              d="M12 3v2M12 19v2M21 12h-2M5 12H3M17.657 6.343l-1.414 1.414M7.757 16.243l-1.414 1.414M17.657 17.657l-1.414-1.414M7.757 7.757L6.343 6.343" />
            <circle cx="12" cy="12" r="4" />
          </svg>
          <!-- Show moon icon in light mode (to switch to dark) -->
          <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
          </svg>
        </button>
        <button @click="handleLogout" class="btn-icon text-white" title="Çıkış Yap">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
            <path d="M16 13v-2H7V8l-5 4 5 4v-3z" />
            <path
              d="M20 3h-9c-1.103 0-2 .897-2 2v4h2V5h9v14h-9v-4H9v4c0 1.103.897 2 2 2h9c1.103 0 2-.897 2-2V5c0-1.103-.897-2-2-2z" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Chat List -->
    <div class="chat-content scrollbar-thin">
      <div v-if="chats.length === 0" class="flex flex-col items-center justify-center h-full text-center text-muted">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="80" height="80"
          class="opacity-30 mb-4">
          <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z" />
        </svg>
        <p class="text-lg font-semibold text-secondary mb-2">Henüz sohbet yok</p>
        <span class="text-sm">Aşağıdan bir kullanıcı seçerek başlayın</span>
      </div>

      <div v-else>
        <!-- Grup Sohbetleri -->
        <div v-if="groupChats.length > 0">
          <div class="p-3 bg-surface-light">
            <h3 class="text-xs font-semibold text-muted uppercase tracking-wide">Grup Sohbetleri</h3>
          </div>
          <div class="divide-y divide-border-light">
            <div v-for="chat in groupChats" :key="chat.id" @click="openChat(chat.id)"
              class="flex gap-md p-4 cursor-pointer hover:bg-border-light transition-colors">
              <div>
                <img :src="chat.userAvatar" :alt="chat.userName" class="avatar avatar-lg" />
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex justify-between items-center mb-1">
                  <div class="flex items-center gap-2">
                    <h3 class="font-semibold text-primary truncate">{{ chat.userName }}</h3>
                    <span v-if="chat.unreadCount > 0" class="unread-badge ml-1">
                      {{ chat.unreadCount }}
                    </span>
                  </div>
                  <span class="text-xs text-muted">{{ formatTime(chat.lastMessageTime) }}</span>
                </div>
                <p class="text-sm text-secondary truncate"
                  :class="{ 'font-semibold text-primary': chat.unreadCount > 0 }">
                  {{ chat.lastMessage }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- İkili Sohbetler -->
        <div v-if="directChats.length > 0" class="border-t border-border-light">
          <div class="p-3 bg-surface-light">
            <h3 class="text-xs font-semibold text-muted uppercase tracking-wide">İkili Sohbetler</h3>
          </div>
          <div class="divide-y divide-border-light">
            <div v-for="chat in directChats" :key="chat.id" @click="openChat(chat.id)"
              class="flex gap-md p-4 cursor-pointer hover:bg-border-light transition-colors">
              <div>
                <img :src="chat.userAvatar" :alt="chat.userName" class="avatar avatar-lg" />
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex justify-between items-center mb-1">
                  <div class="flex items-center gap-2">
                    <h3 class="font-semibold text-primary truncate">{{ chat.userName }}</h3>
                    <span v-if="chat.unreadCount > 0" class="unread-badge ml-1">
                      {{ chat.unreadCount }}
                    </span>
                  </div>
                  <span class="text-xs text-muted">{{ formatTime(chat.lastMessageTime) }}</span>
                </div>
                <p class="text-sm text-secondary truncate"
                  :class="{ 'font-semibold text-primary': chat.unreadCount > 0 }">
                  {{ chat.lastMessage }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- "Yeni Sohbet Başlat" removed: direct chats are auto-created on profile insert -->
      </div>
    </div>
  </div>
</template>

<style scoped>
.unread-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 1.5rem;
  height: 1.5rem;
  padding: 0 0.375rem;
  background-color: var(--secondary-color);
  color: white;
  font-size: 0.75rem;
  font-weight: 700;
  border-radius: 0.75rem;
  flex-shrink: 0;
}

.space-y-2>*+* {
  margin-top: 0.5rem;
}

.divide-y>*+* {
  border-top: 1px solid var(--border-light);
}

.opacity-30 {
  opacity: 0.3;
}

.ml-1 {
  margin-left: 0.5rem;
}

.mb-4 {
  margin-bottom: 1rem;
}

.mb-2 {
  margin-bottom: 0.5rem;
}

.mb-1 {
  margin-bottom: 0.25rem;
}

.min-w-5 {
  min-width: 1.25rem;
}

.h-5 {
  height: 1.25rem;
}

.px-1 {
  padding-left: 0.25rem;
  padding-right: 0.25rem;
}

.p-3 {
  padding: 0.75rem;
}

.p-4 {
  padding: 1rem;
}

.p-6 {
  padding: 1.5rem;
}

.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tracking-wide {
  letter-spacing: 0.05em;
}

.uppercase {
  text-transform: uppercase;
}

.border-t {
  border-top: 1px solid var(--border-color);
}

.hover\:bg-gray-50:hover {
  background-color: #f9fafb;
}

.hover\:translate-x-1:hover {
  transform: translateX(0.25rem);
}

.transition-colors {
  transition: background-color 0.2s ease;
}

.transition-all {
  transition: all 0.2s ease;
}

.cursor-pointer {
  cursor: pointer;
}
</style>
