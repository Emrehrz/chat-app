<template>
  <div class="overlay">
    <div class="modal">
      <h2>Kullanıcı Adı Oluştur</h2>
      <p>Lütfen platformda görünmesini istediğiniz kullanıcı adını seçin.</p>

      <input v-model="username" placeholder="Kullanıcı adınız" />
      <div class="actions">
        <button class="btn" :disabled="loading" @click="submit">Kaydet</button>
      </div>

      <p v-if="error" class="error">{{ error }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()
const username = ref(auth.currentUser?.username || '')
const loading = ref(false)
const error = ref(null)

const submit = async () => {
  if (!username.value || username.value.length < 3) {
    error.value = 'Kullanıcı adı en az 3 karakter olmalıdır.'
    return
  }
  loading.value = true
  error.value = null
  const { success, error: err } = await auth.setUsername(username.value.trim())
  loading.value = false
  if (!success) {
    error.value = err || 'Kullanıcı adı güncellenemedi.'
  }
}
</script>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(2, 6, 23, 0.5);
  z-index: 60;
}

.modal {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  width: min(560px, 95%);
  box-shadow: 0 10px 30px rgba(2, 6, 23, 0.2);
}

.modal h2 {
  margin: 0 0 0.5rem 0;
}

.modal p {
  color: #475569
}

input {
  width: 100%;
  padding: 0.6rem 0.8rem;
  margin-top: 0.75rem;
  border-radius: 8px;
  border: 1px solid #e6eef7;
}

.actions {
  margin-top: 1rem;
  display: flex;
  gap: 8px
}

.btn {
  background: #0f172a;
  color: white;
  padding: 0.6rem 1rem;
  border-radius: 8px;
  border: none
}

.error {
  color: #b91c1c;
  margin-top: 0.5rem
}
</style>
