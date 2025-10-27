import { ref, watch } from 'vue'
import { defineStore } from 'pinia'

export const useThemeStore = defineStore('theme', () => {
  const theme = ref('light')

  function applyTheme() {
    const root = document.documentElement
    root.setAttribute('data-theme', theme.value)
    localStorage.setItem('chatAppTheme', theme.value)
  }

  function initTheme() {
    const saved = localStorage.getItem('chatAppTheme')
    if (saved === 'light' || saved === 'dark') {
      theme.value = saved
    } else {
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
      theme.value = prefersDark ? 'dark' : 'light'
    }
    applyTheme()
  }

  function toggleTheme() {
    theme.value = theme.value === 'dark' ? 'light' : 'dark'
    applyTheme()
  }

  // Keep in sync if changed programmatically
  watch(theme, applyTheme)

  return { theme, initTheme, toggleTheme }
})
