<script setup lang="ts">
import { milestones } from '../assets/data'

const upcoming = milestones.filter((m) => !m.done)
</script>

<template>
  <ol class="timeline">
    <li v-for="m in upcoming" :key="m.text">
      <span class="when">{{ m.when }}</span>
      <span class="dot" />
      <span class="what">{{ m.text }}</span>
    </li>
  </ol>
</template>

<style scoped>
.timeline {
  position: relative;
  list-style: none;
}

/* The spine runs through the dots */
.timeline::before {
  content: "";
  position: absolute;
  left: 49px;
  top: 8px;
  bottom: 8px;
  width: 2px;
  background: var(--color-line);
}

li {
  display: grid;
  grid-template-columns: 40px 20px 1fr;
  align-items: start;
  padding: 3px 0;
  font-size: 13px;
  line-height: 1.4;
}

/* Flush left, like the date headers in the updates feed */
.when {
  padding: 1px 2px 0 0;
  font-family: var(--font-family-mono);
  font-size: 11px;
  text-align: left;
  color: var(--color-text-secondary);
}

.dot {
  position: relative;
  z-index: 1;
  width: 10px;
  height: 10px;
  margin: 4px 0 0 5px;
  border-radius: 50%;
  background: var(--color-card-bg);
  border: 2px solid var(--color-accent);
}

.what {
  color: var(--color-text-secondary);
}
</style>
