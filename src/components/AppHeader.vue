<template>
  <v-app-bar density="compact" class="justify-space-between" elevation="2">
    <v-app-bar-title>Template Engine Live Preview</v-app-bar-title>
    <div class="d-flex align-center gap-2">
      <div class="d-flex align-center gap-1">
        <v-icon size="small">mdi-bug</v-icon>
        <v-switch
          v-model="debugMode"
          density="compact"
          hide-details
          class="mt-0"
          @update:model-value="toggleDebug"
        />
      </div>
      <v-btn
        :icon="theme.global.current.value.dark ? 'mdi-weather-sunny' : 'mdi-moon-waning-crescent'"
        @click="toggleTheme"
        variant="text"
      />
    </div>
  </v-app-bar>
</template>

<script setup>
  import { ref, onMounted } from 'vue'
  import { useTheme } from '@/composables/useTheme'

  const { theme, toggleTheme } = useTheme()
  const debugMode = ref(false)

  onMounted(() => {
    // Load debug state from localStorage
    const savedDebugMode = localStorage.getItem('debugMode') === 'true'
    debugMode.value = savedDebugMode
    
    // Emit the event on mount to initialize debug mode
    if (savedDebugMode) {
      window.dispatchEvent(new CustomEvent('debug-toggle', { detail: true }))
    }
  })

  const toggleDebug = (value) => {
    // Save to localStorage
    localStorage.setItem('debugMode', value)
    // Emit event to builder page
    window.dispatchEvent(new CustomEvent('debug-toggle', { detail: value }))
  }
</script>
