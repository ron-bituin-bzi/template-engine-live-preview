import { useTheme as useVuetifyTheme } from 'vuetify'
import { onMounted } from 'vue'

export function useTheme() {
  const theme = useVuetifyTheme()

  const toggleTheme = () => {
    theme.global.name.value = theme.global.current.value.dark ? 'light' : 'dark'
    localStorage.setItem('theme', theme.global.name.value)
  }

  const initializeTheme = () => {
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme) {
      theme.global.name.value = savedTheme
    }
  }

  onMounted(() => {
    initializeTheme()
  })

  return {
    theme,
    toggleTheme,
  }
}
