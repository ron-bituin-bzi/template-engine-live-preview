<template>
  <v-app-bar density="compact" class="justify-space-between" elevation="2">
    <v-app-bar-title>Template Engine Live Preview</v-app-bar-title>

    <div class="d-flex align-center gap-2 mr-2">

      <!-- Debug squircle -->
      <v-sheet class="control-squircle d-flex align-center mr-2">
        <span class="mr-1">Debug</span>
        <v-icon size="small" class="mr-1">mdi-bug</v-icon>
        <v-switch
          v-model="debugMode"
          density="compact"
          hide-details
          class="mt-0"
          @update:model-value="toggleDebug"
        />
      </v-sheet>

      <!-- Theme squircle -->
      <v-sheet class="control-squircle d-flex align-center justify-center">
        <v-btn
          :icon="theme.global.current.value.dark
            ? 'mdi-weather-sunny'
            : 'mdi-moon-waning-crescent'"
          @click="toggleTheme"
          variant="text"
          density="compact"
        />
      </v-sheet>

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
<style scoped>
.control-squircle {
  padding: 4px 10px;
  min-height: 40px;
  max-height: 40px;

  /*make the background color cream color */
  background-color: #cbcaa5df;
  border: 1px solid rgba(var(--v-theme-outline), 0.4);

  border-radius: 12px; /* ← squircle look */
  transition: background-color 0.2s ease, box-shadow 0.2s ease;
}

/* Hover effect (button-like) */
.control-squircle:hover {
  background-color: rgba(var(--v-theme-primary), 0.08);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}

</style>