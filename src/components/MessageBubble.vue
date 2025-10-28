<script setup>
import { computed } from 'vue'

const props = defineProps({
  message: {
    type: Object,
    required: true
  },
  isSent: {
    type: Boolean,
    required: true
  },
  isGroup: {
    type: Boolean,
    default: false
  }
})

const formatTime = (timestamp) => {
  const date = new Date(timestamp)
  return date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
}

// Deterministic color per sender (works on light/dark themes)
const palette = [
  '#3b82f6', // blue-500
  '#ef4444', // red-500
  '#10b981', // emerald-500
  '#f59e0b', // amber-500
  '#8b5cf6', // violet-500
  '#06b6d4', // cyan-500
  '#f97316', // orange-500
  '#22c55e'  // green-500
]

function getSenderColor(senderId) {
  if (!senderId) return '#3b82f6'
  const str = String(senderId)
  let hash = 0
  for (let i = 0; i < str.length; i++) hash = (hash + str.charCodeAt(i)) % 2147483647
  const idx = hash % palette.length
  return palette[idx]
}
</script>

<template>
  <div class="message-bubble" :class="{ 'sent': isSent, 'received': !isSent }">
    <!-- Sender name only for received messages in group chats -->
    <div v-if="!isSent && isGroup && message.senderName" class="sender-name" :style="{ color: getSenderColor(message.senderId) }">
      {{ message.senderName }}
    </div>
    <div v-if="message.type === 'image' && message.imageUrl" class="message-image">
      <img :src="message.imageUrl" :alt="message.text || 'Resim'" />
    </div>
    <div v-if="message.text" class="message-text">
      {{ message.text }}
    </div>
    <div class="message-meta">
      <span class="message-time">{{ formatTime(message.timestamp) }}</span>
      <span v-if="isSent" class="message-status">
        <svg v-if="message.read" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 15" class="checkmark read">
          <path
            d="M15.01 3.316l-.478-.372a.365.365 0 0 0-.51.063L8.666 9.879a.32.32 0 0 1-.484.033l-.358-.325a.319.319 0 0 0-.484.032l-.378.483a.418.418 0 0 0 .036.541l1.32 1.266c.143.14.361.125.484-.033l6.272-8.048a.366.366 0 0 0-.064-.512zm-4.1 0l-.478-.372a.365.365 0 0 0-.51.063L4.566 9.879a.32.32 0 0 1-.484.033L1.891 7.769a.366.366 0 0 0-.515.006l-.423.433a.364.364 0 0 0 .006.514l3.258 3.185c.143.14.361.125.484-.033l6.272-8.048a.365.365 0 0 0-.063-.51z" />
        </svg>
        <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 15" class="checkmark">
          <path
            d="M15.01 3.316l-.478-.372a.365.365 0 0 0-.51.063L8.666 9.879a.32.32 0 0 1-.484.033l-.358-.325a.319.319 0 0 0-.484.032l-.378.483a.418.418 0 0 0 .036.541l1.32 1.266c.143.14.361.125.484-.033l6.272-8.048a.366.366 0 0 0-.064-.512z" />
        </svg>
      </span>
    </div>
  </div>
</template>

<style scoped>
.message-bubble {
  max-width: 65%;
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  margin-bottom: 0.5rem;
  word-wrap: break-word;
  animation: slideIn 0.2s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.message-bubble.sent {
  background: #dcf8c6;
  align-self: flex-end;
  border-bottom-right-radius: 2px;
}

.message-bubble.received {
  background: white;
  align-self: flex-start;
  border-bottom-left-radius: 2px;
}

.sender-name {
  font-size: 0.75rem;
  font-weight: 600;
  margin-bottom: 0.15rem;
}

.message-image {
  margin-bottom: 0.25rem;
}

.message-image img {
  max-width: 100%;
  border-radius: 6px;
  display: block;
}

.message-text {
  color: #1a202c;
  font-size: 0.95rem;
  line-height: 1.4;
  margin-bottom: 0.25rem;
}

.message-meta {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.25rem;
}

.message-time {
  font-size: 0.7rem;
  color: #667781;
}

.message-status {
  display: flex;
  align-items: center;
}

.checkmark {
  width: 16px;
  height: 16px;
  fill: #667781;
}

.checkmark.read {
  fill: #53bdeb;
}

@media (max-width: 768px) {
  .message-bubble {
    max-width: 80%;
  }
}
</style>
