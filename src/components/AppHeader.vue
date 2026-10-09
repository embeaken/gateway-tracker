<script setup lang="ts">
import BrandMark from './BrandMark.vue'
</script>

<template>
  <header class="app-header">
    <div class="container header-content">
      <a href="/" class="brand-lockup" aria-label="hudson.tube home">
        <BrandMark class="brand-icon" />
        <span>
          <span class="brand-name">hudson.tube</span>
        </span>
      </a>

    </div>
  </header>
</template>

<style scoped>
.app-header {
  background: var(--color-navy);
  color: white;
  border-bottom: 3px solid var(--color-accent);
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-md);
  padding-top: 14px;
  padding-bottom: 14px;
}

.brand-lockup {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
  color: white;
}

.brand-lockup:hover,
.brand-lockup:visited {
  color: white;
  text-decoration: none;
}

.brand-icon {
  color: var(--color-accent);
}

.brand-name {
  display: block;
}

.brand-name {
  font-family: var(--font-family-display);
  font-size: 23px;
  font-weight: var(--font-weight-semibold);
  line-height: 1;
}

@media (max-width: 640px) {
  .header-content {
    gap: 12px;
  }

  .brand-lockup {
    gap: 9px;
  }

  .brand-icon {
    width: 28px;
    height: 28px;
  }

  .brand-name {
    font-size: 20px;
  }
}
</style>
