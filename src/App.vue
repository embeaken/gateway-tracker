<script setup lang="ts">
import { ref } from 'vue'
import AppHeader from './components/AppHeader.vue'
import OverviewExplainer from './components/OverviewExplainer.vue'
import AppFooter from './components/AppFooter.vue'

if (import.meta.env.VITE_PLAYWRIGHT) {
  document.documentElement.dataset.visualTest = 'true'
}

const showExplainer = ref(false)
</script>

<template>
  <AppHeader :explainer-open="showExplainer" @open-explainer="showExplainer = true" />
  <OverviewExplainer :open="showExplainer" @close="showExplainer = false" />

  <RouterView />

  <AppFooter />
</template>
