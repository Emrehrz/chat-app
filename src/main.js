import './assets/styles.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { useThemeStore } from './stores/theme'
import { useAuthStore } from './stores/auth'

import App from './App.vue'
import router from './router'

const app = createApp(App)

const pinia = createPinia()
app.use(pinia)

// Initialize theme before mounting
const themeStore = useThemeStore()
themeStore.initTheme()

// Initialize auth state
const authStore = useAuthStore()
authStore.initialize()

app.use(router)

app.mount('#app')
