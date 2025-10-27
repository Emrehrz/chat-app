import './assets/styles.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { useThemeStore } from './stores/theme'

import App from './App.vue'
import router from './router'

const app = createApp(App)

const pinia = createPinia()
app.use(pinia)

// Initialize theme before mounting
const themeStore = useThemeStore()
themeStore.initTheme()
app.use(router)

app.mount('#app')
