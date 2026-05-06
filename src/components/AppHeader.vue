<script setup lang="ts">
import ThemeToggle from './ThemeToggle.vue'
</script>

<template>
  <header class="app-header">
    <div class="container">
      <div class="header-content">
        <div class="brand-row">
          <a href="#" class="brand-lockup" aria-label="hudson.tube home">
            <span class="brand-mark" aria-hidden="true">H</span>
            <span>
              <span class="brand-name">hudson.tube</span>
              <span class="brand-subtitle">Gateway construction tracker</span>
            </span>
          </a>
          <ThemeToggle />
        </div>
      </div>
    </div>
  </header>
</template>

<style scoped>
.app-header {
  background: var(--color-primary-dark);
  color: white;
  padding: 12px 0;
  border-bottom: 3px solid var(--color-accent);
}

[data-theme="dark"] .app-header {
  background: #083344;
}

@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) .app-header {
    background: #083344;
  }
}

.brand-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--spacing-md);
}

.brand-lockup {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  color: white;
  border-bottom: 0;
}

.brand-lockup:hover,
.brand-lockup:visited {
  color: white;
  border-bottom: 0;
}

.brand-mark {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border: 2px solid rgba(255, 255, 255, 0.82);
  border-radius: var(--radius-sm);
  color: white;
  font-size: 18px;
  font-weight: var(--font-weight-bold);
  line-height: 1;
}

.brand-name,
.brand-subtitle {
  display: block;
}

.brand-name {
  color: white;
  font-size: 20px;
  font-weight: var(--font-weight-bold);
  line-height: 1;
  letter-spacing: 0;
}

.brand-subtitle {
  margin-top: 3px;
  color: rgba(255, 255, 255, 0.76);
  font-size: 12px;
  font-weight: var(--font-weight-semibold);
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

@media (max-width: 768px) {
  .app-header {
    padding: 10px 0;
  }

  .brand-mark {
    width: 30px;
    height: 30px;
    font-size: 16px;
  }

  .brand-name {
    font-size: 18px;
  }

  .brand-subtitle {
    font-size: 10px;
  }

}
</style>
