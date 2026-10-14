<script setup lang="ts">
import RouteMap from '../components/RouteMap.vue'
import TbmCard from '../components/TbmCard.vue'
import DashCard from '../components/DashCard.vue'
import CameraWall from '../components/CameraWall.vue'
import PackagesTable from '../components/PackagesTable.vue'
import FundingCard from '../components/FundingCard.vue'
import PhotoGallery from '../components/PhotoGallery.vue'
import ProjectTimeline from '../components/ProjectTimeline.vue'
import ActivityTimeline from '../components/ActivityTimeline.vue'
import { useTbmProgress } from '../useTbmProgress'

const tbmProgress = useTbmProgress()
</script>

<template>
  <main class="dashboard container">
    <div class="dash-main">
      <RouteMap class="route-map" />

      <div class="tbms">
        <TbmCard v-for="p in tbmProgress" :key="p.tbm.id" :progress="p" />
      </div>

      <DashCard id="cameras" title="Construction cameras" title-id="cameras-title">
        <template #meta>
          <RouterLink to="/cameras">See all →</RouterLink>
        </template>
        <CameraWall />
      </DashCard>

      <div class="pair">
        <DashCard id="funding" title="Financing" title-id="funding-title" >
          <FundingCard />
        </DashCard>
        <DashCard id="photos" title="Photos" title-id="photos-title" >
          <PhotoGallery />
        </DashCard>
      </div>

      <DashCard id="packages" title="Construction packages" title-id="packages-title">
        <PackagesTable />
      </DashCard>
    </div>

    <aside class="dash-rail">
      <DashCard id="timeline" title="Timeline" title-id="timeline-title">
        <ProjectTimeline />
      </DashCard>
      <DashCard id="activity" class="feed" title="Updates from the GDC" title-id="activity-title">
        <div class="feed-scroll">
          <ActivityTimeline />
        </div>
      </DashCard>
    </aside>
  </main>
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

/* Hidden on phones and tablets (where it would switch to the vertical list) until it's redesigned */
@media (max-width: 1024px) {
  .route-map {
    display: none;
  }
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

/* Narrower: one column. Flatten the main column and rail so their cards can
   be reordered together. The feed grows with the page (it has its own "Show
   more"): a scroll box inside a scrolling page traps touch scrolling. */
@media (max-width: 1199px) {
  .dash-main,
  .dash-rail,
  .pair {
    display: contents;
  }

  .route-map { order: 0; }
  .tbms { order: 1; }
  #cameras { order: 2; }
  #photos { order: 3; }
  #activity { order: 4; }
  #timeline { order: 5; }
  #funding { order: 6; }
  #packages { order: 7; }
}
</style>
