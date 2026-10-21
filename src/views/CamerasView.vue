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
    <h1 class="cams-title">Construction cameras</h1>

    <nav class="sites" aria-label="Jump to a site">
      <RouterLink v-for="p in projects" :key="p.id" :to="{ name: 'cameras', hash: `#${p.id}` }" class="site-chip">
        {{ p.name }}
      </RouterLink>
    </nav>

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

.cams-title {
  /* Same column as the cards (see CameraArchive) */
  width: 100%;
  max-width: 1280px;
  margin-inline: auto;
  font-size: 28px;
  line-height: 1.15;
}

/* Stays in reach while scrolling the long page */
.sites {
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  gap: 6px;
  margin: 0 calc(-1 * var(--spacing-md));
  padding: 8px max(var(--spacing-md), calc((100% - 1280px) / 2 + var(--spacing-md)));
  background: var(--color-background);
}

@media (max-width: 768px) {
  .sites {
    margin: 0 calc(-1 * var(--spacing-sm));
    padding-inline: var(--spacing-sm);
  }
}

.site-chip {
  flex: none;
  white-space: nowrap;
  padding: 6px 12px;
  border: 1px solid var(--color-border);
  border-radius: 999px;
  background: var(--color-card-bg);
  color: var(--color-text-primary);
  font-size: 13px;
  font-weight: var(--font-weight-semibold);
}

.site-chip:visited {
  color: var(--color-text-primary);
}

.site-chip:hover {
  border-color: var(--color-primary);
  text-decoration: none;
}
</style>
