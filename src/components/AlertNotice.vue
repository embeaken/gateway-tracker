<script setup lang="ts">
// Alert notice for important project updates
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
              Federal funding for the Gateway Program has been temporarily suspended pending ongoing litigation.
              The project, which would replace the 114-year-old North River Tunnels and expand capacity for
              200,000 daily commuters, is currently subject to legal challenges regarding its environmental
              impact statements and funding allocation.
            </p>
            <p>
              Multiple lawsuits are currently pending in federal court, with oral arguments scheduled for the
              coming months. Despite the funding freeze, preliminary site work and planning activities continue
              under existing appropriations. Local and state officials have pledged to explore alternative
              funding mechanisms to keep the project moving forward.
            </p>
            <p>
              <strong>This is critical infrastructure:</strong> The existing tunnels are deteriorating and
              could fail at any time, which would be catastrophic for the Northeast Corridor and the national
              economy. Delays in funding put thousands of jobs at risk and jeopardize the $19.6 billion in
              economic activity this project represents.
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
  margin-bottom: var(--spacing-xl);
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
