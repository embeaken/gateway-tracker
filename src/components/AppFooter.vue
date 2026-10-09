<script setup lang="ts">
import ThemeToggle from './ThemeToggle.vue'

// Gateway Tracker Footer
</script>

<template>
  <footer class="app-footer">
    <div class="container footer-content">
      <div class="footer-copy">
        <p class="footer-sign">Made with civic pride by Ilya Rubnich</p>
        <p>
          Unofficial fan site. Photos, video and documents from the
          <a href="https://www.gatewayprogram.org/" target="_blank" rel="noopener">Gateway Development Commission</a>;
          live cams by EarthCam.
          <a href="https://github.com/embeaken/gateway-tracker" target="_blank" rel="noopener">Source on GitHub</a>
        </p>
      </div>
      <ThemeToggle />
    </div>
  </footer>
</template>

<style scoped>
.app-footer {
  margin-top: var(--spacing-2xl);
  padding: var(--spacing-xl) 0;
  background-color: var(--color-navy);
  border-top: 3px solid var(--color-accent);
}

.footer-sign {
  font-family: var(--font-family-display);
  font-size: 21px !important;
  font-weight: var(--font-weight-semibold);
  color: white !important;
  margin-bottom: 4px !important;
}

.app-footer :deep(.theme-toggle) {
  color: rgba(255, 255, 255, 0.7);
  border-color: rgba(255, 255, 255, 0.2);
}

.footer-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-sm);
}

.app-footer p {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
  margin: 0;
}

.app-footer a,
.app-footer a:visited {
  color: white;
  font-weight: var(--font-weight-medium);
}

.app-footer a:hover {
  color: white;
  border-bottom-color: var(--color-accent);
}

@media (max-width: 768px) {
  .app-footer {
    margin-top: var(--spacing-sm);
    padding: var(--spacing-md) 0;
  }
}
</style>
