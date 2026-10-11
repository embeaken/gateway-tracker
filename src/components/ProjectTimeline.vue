<script setup lang="ts">
import { milestones } from '../assets/data'

// Done items, a "Today" marker, then dates GDC has announced.
const firstUpcoming = milestones.findIndex((m) => !m.done)
</script>

<template>
  <ol class="timeline">
    <template v-for="(m, i) in milestones" :key="m.text">
      <li v-if="i === firstUpcoming" class="today" aria-label="Today">
        <span class="when" />
        <span class="dot" />
        <span class="what">Today</span>
      </li>
      <li :class="m.done ? 'done' : 'upcoming'">
        <span class="when">{{ m.when }}</span>
        <span class="dot" />
        <span class="what"><span class="sr-only">{{ m.done ? 'Done: ' : 'Scheduled: ' }}</span>{{ m.text }}</span>
      </li>
    </template>
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
  left: 85px;
  top: 8px;
  bottom: 8px;
  width: 2px;
  background: var(--color-line);
}

li {
  display: grid;
  grid-template-columns: 76px 20px 1fr;
  align-items: start;
  padding: 3px 0;
  font-size: 13px;
  line-height: 1.4;
}

.when {
  padding: 1px 2px 0 0;
  font-family: var(--font-family-mono);
  font-size: 11px;
  text-align: right;
  color: var(--color-text-secondary);
}

.dot {
  position: relative;
  z-index: 1;
  width: 10px;
  height: 10px;
  margin: 4px 0 0 5px;
  border-radius: 50%;
  background: var(--color-ok);
}

.upcoming .dot {
  background: var(--color-card-bg);
  border: 2px solid var(--color-accent);
}

.upcoming .what {
  color: var(--color-text-secondary);
}

.today {
  padding: 6px 0;
  font-size: 11px;
  font-weight: var(--font-weight-bold);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-accent-ink);
}

.today .dot {
  background: var(--color-accent);
}
</style>
