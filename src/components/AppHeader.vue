<template>
  <v-app-bar density="compact" class="justify-space-between" elevation="2">
    <v-app-bar-title>Template Engine Live Preview</v-app-bar-title>
    <v-btn
      :icon="theme.global.current.value.dark ? 'mdi-weather-sunny' : 'mdi-moon-waning-crescent'"
      @click="toggleTheme"
      variant="text"
    />
  </v-app-bar>
</template>

<script setup>
  import { useTheme } from '@/composables/useTheme'

  const { theme, toggleTheme } = useTheme()
</script>
