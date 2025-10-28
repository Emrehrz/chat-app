<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useChatStore } from '../stores/chat'
import { useThemeStore } from '../stores/theme'
import MessageBubble from '../components/MessageBubble.vue'
import ChatInput from '../components/ChatInput.vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const chatStore = useChatStore()
const themeStore = useThemeStore()

const messagesContainer = ref(null)
const chatId = computed(() => route.params.id)

const currentChat = computed(() => {
  return chatStore.getChatById(chatId.value)
})

onMounted(() => {
  if (chatId.value && authStore.currentUser) {
    chatStore.setActiveChat(chatId.value)
    // Subscribe to realtime updates for this chat
    chatStore.subscribeToChat(chatId.value, authStore.currentUser.id)
  }
  scrollToBottom()
})

onUnmounted(() => {
  // Note: We don't unsubscribe here to keep receiving messages
  // Subscriptions are managed globally in chat store
})

watch(() => currentChat.value?.messages, () => {
  nextTick(() => {
    scrollToBottom()
  })
}, { deep: true })

const scrollToBottom = () => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

const handleSendMessage = (messageData) => {
  if (!currentChat.value) return

  chatStore.sendMessage(chatId.value, {
    senderId: authStore.currentUser.id,
    senderName: authStore.currentUser.username,
    text: messageData.text,
    type: messageData.type,
    imageUrl: messageData.imageUrl
  })

  scrollToBottom()
}

const goBack = () => {
  router.push('/')
}

const isSentByMe = (message) => {
  return message.senderId === authStore.currentUser?.id
}
</script>

<template>
  <div class="container chat-container">
    <!-- Header -->
    <div class="chat-header flex items-center gap-md">
      <button @click="goBack" class="btn-icon text-white">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
          <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
        </svg>
      </button>
      <div v-if="currentChat" class="flex items-center gap-md flex-1">
        <img :src="currentChat.userAvatar" :alt="currentChat.userName" class="avatar avatar-md" />
        <div class="flex flex-col">
          <h2 class="font-medium">{{ currentChat.userName }}</h2>
          <span class="text-sm opacity-90">Çevrimiçi</span>
        </div>
      </div>
      <button @click="themeStore.toggleTheme()" class="btn-icon text-white"
        :title="themeStore.theme === 'dark' ? 'Açık Tema' : 'Koyu Tema'">
        <!-- Sun icon (dark -> light) -->
        <svg v-if="themeStore.theme === 'dark'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22"
          height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path
            d="M12 3v2M12 19v2M21 12h-2M5 12H3M17.657 6.343l-1.414 1.414M7.757 16.243l-1.414 1.414M17.657 17.657l-1.414-1.414M7.757 7.757L6.343 6.343" />
          <circle cx="12" cy="12" r="4" />
        </svg>
        <!-- Moon icon (light -> dark) -->
        <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22" fill="none"
          stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
        </svg>
      </button>
    </div>

    <!-- Messages -->
    <div ref="messagesContainer" class="message-area flex-1 overflow-y-auto scrollbar-thin p-4">
      <div v-if="!currentChat || currentChat.messages.length === 0"
        class="flex flex-col items-center justify-center h-full text-center text-muted">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="80" height="80"
          class="opacity-30 mb-4">
          <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z" />
        </svg>
        <p class="text-lg font-medium text-secondary mb-2">Henüz mesaj yok</p>
        <span class="text-sm">İlk mesajı göndererek sohbeti başlatın</span>
      </div>

      <div v-else class="flex flex-col gap-1">
        <MessageBubble v-for="message in currentChat.messages" :key="message.id" :message="message"
          :is-sent="isSentByMe(message)" :is-group="currentChat.isGroup" class="scale-in" />
      </div>
    </div>

    <!-- Input -->
    <div class="chat-input-area">
      <ChatInput @send="handleSendMessage" />
    </div>
  </div>
</template>

<style scoped>
.gap-1 {
  gap: 0.25rem;
}

.opacity-90 {
  opacity: 0.9;
}
</style>
