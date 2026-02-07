<script setup lang="ts">
// Alert notice for funding crisis
</script>

<template>
  <div class="alert-notice">
    <div class="container">
      <div class="alert-content">
        <div class="alert-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <line x1="12" y1="9" x2="12" y2="13" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <line x1="12" y1="17" x2="12.01" y2="17" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <div class="alert-text">
          <h3 class="alert-title">Project Funding Update</h3>
          <div class="alert-body">
            <p>
              A federal judge has <a href="https://www.nydailynews.com/2026/02/06/ny-judge-tro-trump-administration-resume-funding-hudson-river-tunnel/" target="_blank">ordered</a> the government to temporarily stop withholding payments to the Gateway Development Commission while lawsuits play out in court.
            </p>
            <p>
              <strong>Construction is still paused</strong> as of February 6 and no date has been announced for when work could resume.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.alert-notice {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border-bottom: 4px solid #d97706;
  color: #78350f;
  padding: var(--spacing-xl) 0;
  margin-bottom: var(--spacing-l);
}

.alert-content {
  display: flex;
  gap: var(--spacing-md);
  align-items: flex-start;
}

.alert-icon {
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  background: #d97706;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.alert-icon svg {
  width: 28px;
  height: 28px;
  stroke-width: 2.5;
}

.alert-text {
  flex: 1;
  min-width: 0;
}

.alert-title {
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-bold);
  color: #451a03;
  margin: 0 0 var(--spacing-sm) 0;
  letter-spacing: -0.01em;
}

.alert-body {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.alert-body p {
  font-size: var(--font-size-base);
  line-height: var(--line-height-relaxed);
  color: #78350f;
  margin: 0;
}

.alert-body strong {
  color: #451a03;
  font-weight: var(--font-weight-bold);
}

/* Links in alert */
.alert-body a {
  color: #b45309;
  text-decoration: underline;
  border-bottom: none;
}

.alert-body a:hover {
  color: #451a03;
}

@media (max-width: 768px) {
  .alert-notice {
    padding: var(--spacing-md) 0;
  }

  .alert-content {
    flex-direction: column;
    gap: var(--spacing-sm);
  }

  .alert-icon {
    width: 40px;
    height: 40px;
  }

  .alert-icon svg {
    width: 24px;
    height: 24px;
  }

  .alert-title {
    font-size: var(--font-size-base);
  }

  .alert-body p {
    font-size: var(--font-size-sm);
  }
}
</style>
