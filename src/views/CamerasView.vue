<script setup lang="ts">
import { computed } from 'vue'
import { projects } from '../assets/data'
import CameraArchive from '../components/CameraArchive.vue'
import { nyDate } from '../dates'
import { useCams } from '../useCams'

const { data, failed } = useCams()
const sites = computed(() => new Map(data.value?.sites.map((s) => [s.projectId, s])))
const today = computed(() => nyDate(new Date(data.value?.fetchedAt ?? Date.now())))
</script>

<template>
  <main class="cams container">
    <CameraArchive
      v-for="p in projects"
      :key="p.id"
      :project="p"
      :views="sites.get(p.id)?.views ?? []"
      :panoramas="sites.get(p.id)?.panoramas ?? []"
      :today="today"
      :failed="failed"
    />
  </main>
</template>

<style scoped>
.cams {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  padding-top: var(--spacing-md);
  padding-bottom: var(--spacing-lg);
}

.cams > * {
  min-width: 0;
}
</style>
