<script setup lang="ts">
import BrandMark from './BrandMark.vue'
import { useSiteClock } from '../useSiteClock'

const { time, miningDay } = useSiteClock()
</script>

<template>
  <header class="app-header">
    <div class="container header-content">
      <a href="#" class="brand-lockup" aria-label="hudson.tube home">
        <BrandMark />
        <span>
          <span class="brand-name">hudson<span class="brand-dot">.</span>tube</span>
          <span class="brand-subtitle">Tunnel tracker</span>
        </span>
      </a>

      <a href="#cameras" class="header-status">
        <span class="live-dot" aria-hidden="true"></span>
        <span class="status-text">
          <span class="status-strong">TBM boring</span>
          <span class="status-sep" aria-hidden="true">·</span>
          day {{ miningDay }}
        </span>
        <span class="status-clock">{{ time }} ET</span>
      </a>
    </div>
    <div class="hazard-tape" aria-hidden="true"></div>
  </header>
</template>

<style scoped>
.app-header {
  position: relative;
  background: var(--color-ink);
  color: white;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-md);
  padding-top: 12px;
  padding-bottom: 12px;
}

/* Hazard tape: the construction-site signature, used exactly once. */
.hazard-tape {
  height: 6px;
  background: repeating-linear-gradient(
    -45deg,
    var(--color-accent) 0 10px,
    var(--color-ink) 10px 20px
  );
}

.brand-lockup {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
  color: white;
  border-bottom: 0;
}

.brand-lockup:hover,
.brand-lockup:visited {
  color: white;
  border-bottom: 0;
}

.brand-name,
.brand-subtitle {
  display: block;
}

.brand-name {
  font-family: var(--font-family-display);
  font-size: 26px;
  font-weight: var(--font-weight-bold);
  line-height: 0.9;
  letter-spacing: 0.005em;
}

.brand-dot {
  color: var(--color-accent);
}

.brand-subtitle {
  margin-top: 4px;
  color: rgba(255, 255, 255, 0.6);
  font-family: var(--font-family-mono);
  font-size: 10px;
  font-weight: 500;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.header-status {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 6px 12px;
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 999px;
  color: rgba(255, 255, 255, 0.85);
  font-family: var(--font-family-mono);
  font-size: 12px;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  white-space: nowrap;
}

.header-status:hover,
.header-status:visited {
  color: white;
  border-color: rgba(255, 255, 255, 0.35);
  border-bottom-color: rgba(255, 255, 255, 0.35);
}

.status-strong {
  color: white;
}

.status-sep {
  margin: 0 4px;
  opacity: 0.5;
}

.status-clock {
  padding-left: 10px;
  border-left: 1px solid rgba(255, 255, 255, 0.16);
  color: rgba(255, 255, 255, 0.6);
}

@media (max-width: 640px) {
  .status-clock {
    display: none;
  }

  .header-status {
    font-size: 11px;
    padding: 5px 10px;
  }

  .brand-subtitle {
    display: none;
  }
}

@media (max-width: 370px) {
  .status-strong,
  .status-sep {
    display: none;
  }
}
</style>
