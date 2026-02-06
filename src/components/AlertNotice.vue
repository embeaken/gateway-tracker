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
              In October 2025, US DOT <a href="https://www.nytimes.com/2025/10/01/nyregion/trump-nyc-subway-gateway-infrastructure-funding.html" target="_blank">illegally froze</a> $18 billion in federal funds for the Gateway Project.
              Two lawsuits have been filed to challenge the funding freeze - <a href="https://www.gatewayprogram.org/wp-content/uploads/2026/02/GDC-2026.02.02-Press-Release-for-Website.pdf" target="_blank">one</a> by the Gateway Development Commission and <a href="https://www.njoag.gov/new-jersey-new-york-sue-trump-administration-for-illegally-withholding-gateway-tunnel-funding/" target="_blank">another</a> by the Attorneys General of NY and NJ.
            </p>
            <p>
              As of February 6, <strong>construction is paused pending the release of federal funds</strong>.
              Further delays will result in the <strong>loss of thousands of jobs</strong> and <strong>increased construction costs</strong> due to inflation.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.alert-notice {
  background: linear-gradient(135deg, #c53030 0%, #9b2c2c 100%);
  border-bottom: 4px solid #742a2a;
  color: white;
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
  background: rgba(255, 255, 255, 0.15);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #FFD700;
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
  color: white;
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
  color: rgba(255, 255, 255, 0.95);
  margin: 0;
}

.alert-body strong {
  color: #FFD700;
  font-weight: var(--font-weight-bold);
}

/* Links in alert */
.alert-body a {
  color: #FFD700;
  text-decoration: underline;
  border-bottom: none;
}

.alert-body a:hover {
  color: white;
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
