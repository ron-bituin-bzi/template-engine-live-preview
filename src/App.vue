<template>
  <v-app>
    <v-app-bar density="compact" class="justify-space-between">
      <v-app-bar-title>Template Engine Live Preview</v-app-bar-title>
      <v-btn
        :icon="theme.global.current.value.dark ? 'mdi-weather-sunny' : 'mdi-moon-waning-crescent'"
        @click="toggleTheme"
        variant="text"
      />
    </v-app-bar>
    <v-main>
      <router-view />
    </v-main>
    <AppFooter />
  </v-app>
</template>

<script setup>
  import { useTheme } from '@/composables/useTheme'
  import AppFooter from '@/components/AppFooter.vue'

  const { theme, toggleTheme } = useTheme()
</script>
