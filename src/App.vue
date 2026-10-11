<script setup lang="ts">
import { ref } from 'vue'
import AppHeader from './components/AppHeader.vue'
import OverviewExplainer from './components/OverviewExplainer.vue'
import RouteMap from './components/RouteMap.vue'
import TbmCard from './components/TbmCard.vue'
import DashCard from './components/DashCard.vue'
import CameraWall from './components/CameraWall.vue'
import PackagesTable from './components/PackagesTable.vue'
import FundingCard from './components/FundingCard.vue'
import PhotoGallery from './components/PhotoGallery.vue'
import ProjectTimeline from './components/ProjectTimeline.vue'
import ActivityTimeline from './components/ActivityTimeline.vue'
import AppFooter from './components/AppFooter.vue'
import { images } from './assets/activityData'
import { useTbmProgress } from './useTbmProgress'

if (import.meta.env.VITE_PLAYWRIGHT) {
  document.documentElement.dataset.visualTest = 'true'
}

const showExplainer = ref(false)
const tbmProgress = useTbmProgress()
</script>

<template>
  <AppHeader :explainer-open="showExplainer" @open-explainer="showExplainer = true" />
  <OverviewExplainer :open="showExplainer" @close="showExplainer = false" />

  <main class="dashboard container">
    <div class="dash-main">
      <RouteMap />

      <div class="tbms">
        <TbmCard v-for="p in tbmProgress" :key="p.tbm.id" :progress="p" />
      </div>

      <DashCard id="cameras" title="Construction cameras" title-id="cameras-title" meta="Latest stills · click for the live player">
        <CameraWall />
      </DashCard>

      <DashCard id="packages" title="Construction packages" title-id="packages-title">
        <PackagesTable />
      </DashCard>

      <div class="pair">
        <DashCard id="funding" title="Paying for the tunnel" title-id="funding-title" meta="$16B budget">
          <FundingCard />
        </DashCard>
        <DashCard id="photos" title="Photos" title-id="photos-title" :meta="`${images.length} from GDC, newest first`">
          <PhotoGallery />
        </DashCard>
      </div>
    </div>

    <aside class="dash-rail">
      <DashCard id="timeline" title="Timeline" title-id="timeline-title">
        <ProjectTimeline />
      </DashCard>
      <DashCard id="activity" class="feed" title="Updates from the GDC" title-id="activity-title">
        <div class="feed-scroll">
          <ActivityTimeline :exclude="['photo']" />
        </div>
      </DashCard>
    </aside>
  </main>

  <AppFooter />
</template>

<style scoped>
.dashboard {
  display: grid;
  gap: var(--spacing-sm);
  padding-top: var(--spacing-sm);
  padding-bottom: var(--spacing-lg);
}

.dash-main,
.dash-rail {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  min-width: 0;
}

.dash-main > *,
.dash-rail > * {
  scroll-margin-top: var(--spacing-sm);
}

.tbms,
.pair {
  display: grid;
  gap: var(--spacing-sm);
}

@media (min-width: 900px) {
  .tbms {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (min-width: 1700px) {
  .pair {
    grid-template-columns: minmax(0, 7fr) minmax(0, 5fr);
    align-items: start;
  }
}

/* Wide screens: the rail sits beside the main column and scrolls on its own */
@media (min-width: 1200px) {
  .dashboard {
    grid-template-columns: minmax(0, 1fr) clamp(340px, 24vw, 520px);
    align-items: start;
  }

  .dash-rail {
    position: sticky;
    top: var(--spacing-sm);
    max-height: calc(100vh - 2 * var(--spacing-sm));
  }

  .feed {
    flex: 1;
    min-height: 260px;
    display: flex;
    flex-direction: column;
  }

  .feed-scroll {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    margin-right: -10px;
    padding-right: 10px;
  }
}

/* Narrower: rail content below, with the feed capped */
@media (max-width: 1199px) {
  .feed-scroll {
    max-height: 900px;
    overflow-y: auto;
  }
}
</style>
