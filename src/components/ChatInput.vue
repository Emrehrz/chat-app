<script setup>
import { ref } from 'vue'

const emit = defineEmits(['send'])

const messageText = ref('')
const fileInput = ref(null)

const handleSend = () => {
  if (messageText.value.trim()) {
    emit('send', { text: messageText.value.trim(), type: 'text' })
    messageText.value = ''
  }
}

const handleKeyPress = (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    handleSend()
  }
}

const handleImageSelect = (e) => {
  const file = e.target.files[0]
  if (file && file.type.startsWith('image/')) {
    const reader = new FileReader()
    reader.onload = (event) => {
      emit('send', {
        text: file.name,
        type: 'image',
        imageUrl: event.target.result
      })
    }
    reader.readAsDataURL(file)
  }
  // Reset input
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const triggerFileInput = () => {
  fileInput.value?.click()
}
</script>

<template>
  <div class="chat-input">
    <button @click="triggerFileInput" class="icon-btn" title="Resim gönder">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path
          d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
      </svg>
    </button>
    <input ref="fileInput" type="file" accept="image/*" @change="handleImageSelect" style="display: none" />
    <input v-model="messageText" type="text" placeholder="Bir mesaj yazın..." @keypress="handleKeyPress"
      class="message-input" />
    <button @click="handleSend" class="send-btn" :disabled="!messageText.trim()">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
      </svg>
    </button>
  </div>
</template>

<style scoped>
.chat-input {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: #f0f2f5;
  border-top: 1px solid #e5e5e5;
}

.icon-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  color: #54656f;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s;
  border-radius: 50%;
}

.icon-btn:hover {
  color: #00a884;
  background: rgba(0, 168, 132, 0.1);
}

.icon-btn svg {
  width: 24px;
  height: 24px;
}

.message-input {
  flex: 1;
  padding: 0.625rem 1rem;
  border: none;
  border-radius: 8px;
  background: white;
  font-size: 0.95rem;
  outline: none;
}

.message-input:focus {
  box-shadow: 0 0 0 2px rgba(0, 168, 132, 0.2);
}

.send-btn {
  background: #00a884;
  border: none;
  cursor: pointer;
  padding: 0.625rem;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s;
}

.send-btn:hover:not(:disabled) {
  background: #008f6d;
  transform: scale(1.05);
}

.send-btn:disabled {
  background: #d1d7db;
  cursor: not-allowed;
}

.send-btn svg {
  width: 20px;
  height: 20px;
}

@media (max-width: 768px) {
  .chat-input {
    padding: 0.625rem;
  }

  .message-input {
    font-size: 16px;
    /* Prevent zoom on iOS */
  }
}
</style>
