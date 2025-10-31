<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const error = ref('')
const isLoading = ref(false)
const mode = ref('login') // 'login' or 'signup'

const isSignupMode = computed(() => mode.value === 'signup')

const handleSubmit = async () => {
  error.value = ''

  if (!email.value.trim()) {
    error.value = 'Lütfen e-posta adresi girin'
    return
  }

  if (!password.value.trim()) {
    error.value = 'Lütfen şifre girin'
    return
  }

  isLoading.value = true

  try {
    let result
    if (isSignupMode.value) {
      result = await authStore.signUp(email.value, password.value)
      if (result.success) {
        error.value = ''
        // Show success message
        alert('Kayıt başarılı! Email onayı gerekebilir. Giriş yapmayı deneyin.')
        mode.value = 'login'
      } else {
        error.value = result.error || 'Kayıt başarısız oldu'
      }
    } else {
      result = await authStore.login(email.value, password.value)
      if (result.success) {
        router.push('/')
      } else {
        error.value = result.error || 'Giriş başarısız oldu'
      }
    }
  } catch (err) {
    error.value = err.message || 'Bir hata oluştu'
  } finally {
    isLoading.value = false
  }
}

const handleKeyPress = (e) => {
  if (e.key === 'Enter') {
    handleSubmit()
  }
}

const toggleMode = () => {
  mode.value = isSignupMode.value ? 'login' : 'signup'
  error.value = ''
}
</script>

<template>
  <div class="full-height flex items-center justify-center p-4"
    style="background: linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%);">
    <div class="surface-elevated w-full max-w-md slide-up shadow-lg rounded-lg overflow-hidden p-4">
      <!-- Header/Brand -->
      <div class="text-center mb-8">
        <div class="w-20 h-20 mx-auto mb-6 rounded-lg flex items-center justify-center text-white"
          style="background: linear-gradient(135deg, #06b6d4 0%, #22c55e 100%);">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="40" height="40">
            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z" />
          </svg>
        </div>
        <h1 class="text-xl font-bold text-primary mb-2">Ekip Sohbeti</h1>
        <p class="text-secondary">
          {{ isSignupMode ? 'Yeni hesap oluştur' : 'Hesabınıza giriş yapın' }}
        </p>
      </div>

      <div class="mb-6">
        <!-- Email -->
        <div class="mb-4">
          <label for="email" class="block font-semibold text-primary mb-2">E-posta</label>
          <input id="email" v-model="email" type="email" placeholder="ornek@ekip.com" @keypress="handleKeyPress"
            autocomplete="email" class="input" :disabled="isLoading" />
        </div>
        <!-- Password -->
        <div class="mb-2">
          <label for="password" class="block font-semibold text-primary mb-2">Şifre</label>
          <input id="password" v-model="password" type="password" placeholder="••••••••" @keypress="handleKeyPress"
            autocomplete="current-password" class="input" :disabled="isLoading" />
        </div>

        <span v-if="error" class="block text-red-500 text-sm mt-2">{{ error }}</span>

        <span v-if="!authStore.isConfigured" class="block text-yellow-600 text-sm mt-2 bg-yellow-50 p-2 rounded">
          ⚠️ Supabase yapılandırılmamış. Mock mode aktif.
        </span>

        <button @click="handleSubmit" class="btn btn-primary w-full text-lg font-semibold py-3 mt-4"
          :disabled="isLoading">
          <span v-if="isLoading">İşleniyor...</span>
          <span v-else>{{ isSignupMode ? 'Kayıt Ol' : 'Giriş Yap' }}</span>
        </button>
      </div>

      <!-- <div class="text-center pt-6 border-t border-border-color">
        <button @click="toggleMode" class="text-primary-color hover:underline text-sm" :disabled="isLoading">
          {{ isSignupMode ? 'Zaten hesabınız var mı? Giriş yapın' : 'Hesabınız yok mu? Kayıt olun' }}
        </button>
      </div> -->
    </div>
  </div>
</template>

<style scoped>
.max-w-md {
  max-width: 28rem;
}

.w-20 {
  width: 5rem;
}

.h-20 {
  height: 5rem;
}

.mx-auto {
  margin-left: auto;
  margin-right: auto;
}

.mb-8 {
  margin-bottom: 2rem;
}

.mb-6 {
  margin-bottom: 1.5rem;
}

.mb-4 {
  margin-bottom: 1rem;
}

.mt-4 {
  margin-top: 1rem;
}

.mb-2 {
  margin-bottom: 0.5rem;
}

.mt-2 {
  margin-top: 0.5rem;
}

.pt-6 {
  padding-top: 1.5rem;
}

.py-3 {
  padding-top: 0.75rem;
  padding-bottom: 0.75rem;
}

.p-4 {
  padding: 2rem;
}

.text-red-500 {
  color: #ef4444;
}

.border-t {
  border-top: 1px solid var(--border-color);
}

.block {
  display: block;
}
</style>
