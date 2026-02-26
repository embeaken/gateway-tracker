<script setup lang="ts">
</script>

<template>
  <div class="alert-notice">
    <div class="container">
      <div class="alert-content">
        <svg class="alert-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
          <line x1="12" y1="9" x2="12" y2="13"/>
          <line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
        <p class="alert-body">
          Construction has resumed. Most federal funds remain frozen while lawsuits play out in court.
          <!--<span class="alert-meta">— Feb 21</span>-->
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.alert-notice {
  background: var(--color-alert-bg);
  border-bottom: 2px solid var(--color-alert-border);
  padding: 10px 0;
}

.alert-content {
  display: flex;
  align-items: center;
  gap: 10px;
}

.alert-icon {
  flex-shrink: 0;
  color: var(--color-alert-icon);
}

.alert-body {
  font-size: var(--font-size-sm);
  line-height: var(--line-height-normal);
  color: var(--color-alert-body);
  margin: 0;
}

.alert-body strong {
  color: var(--color-alert-title);
  font-weight: var(--font-weight-bold);
}

.alert-meta {
  color: var(--color-alert-icon);
  font-size: var(--font-size-xs);
  margin-left: 2px;
}

@media (max-width: 768px) {
  .alert-icon {
    display: none;
  }

  .alert-body {
    font-size: var(--font-size-xs);
  }
}
</style>
