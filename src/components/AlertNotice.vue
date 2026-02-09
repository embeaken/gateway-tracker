<script setup lang="ts">
import { ref } from 'vue'

const detailsOpen = ref(false)
</script>

<template>
  <div class="alert-notice">
    <div class="container">
      <div class="alert-content">
        <div class="alert-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="12" cy="12" r="10" stroke-width="2"/>
            <line x1="12" y1="8" x2="12" y2="12" stroke-width="2" stroke-linecap="round"/>
            <line x1="12" y1="16" x2="12.01" y2="16" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </div>
        <div class="alert-text">
          <h3 class="alert-title">Project Funding Update<small>Last updated: February 8 at 10:30pm</small></h3>
          <div class="alert-body">
            <p>
              <strong>The vibes are mixed.</strong>
              The states of NY and NJ <a href="https://www.nydailynews.com/2026/02/06/ny-judge-tro-trump-administration-resume-funding-hudson-river-tunnel" target="_blank">won</a> a claim for emergency relief to turn the funds back on.
              But the Trump administration <a href="https://www.bloomberg.com/news/articles/2026-02-09/trump-administration-to-appeal-court-order-on-ny-nj-tunnel-funds" target="_blank">will appeal</a>, so expect legal drama ahead.
            </p>
            <p>
              <strong>Construction is paused as of February 6 and no date has been announced for when work could resume.</strong>
              Responding to the judge's emergency order, GDC <a href="https://www.gatewayprogram.org/wp-content/uploads/2026/02/GDC-2026.02.06-GDC-Statement-on-NY-NJ-Lawsuit.pdf" target="_blank">says</a> they are "hopeful this means funding disbursements will resume soon, and we can restart site operations and get our workers back on the job."
            </p>
            <div class="alert-details">
              <button class="details-toggle" @click="detailsOpen = !detailsOpen">
                <span class="details-arrow" :class="{ open: detailsOpen }">▸</span> Click for more wonky details
              </button>
              <div class="details-content" :class="{ open: detailsOpen }">
                <div class="details-inner">
                  <p>
                    Gateway's federal funding is structured like an expense account. Gateway must report what they spent over some period of time and the government then disburses that money to Gateway.
                    Last October the government just stopped doing the disbursing and the amount they owe has been piling up ever since.
                  </p>
                  <p>
                    On February 6, a federal judge <a href="https://www.nydailynews.com/2026/02/06/ny-judge-tro-trump-administration-resume-funding-hudson-river-tunnel/" target="_blank">ordered</a>
                    the government to <strong>temporarily stop not disbursing money</strong> to Gateway while the <a href="https://ag.ny.gov/press-release/2026/attorney-general-james-sues-trump-administration-freezing-gateway-programs" target="_blank">case</a> plays out in court.
                    Yes that's confusing, and it notably doesn't prescribe any timeline to <em>start</em> disbursing money.
                    Meanwhile, the Trump administration filed a notice to appeal the order.
                  </p>
                  <p>The parties will meet on February 10 so there will likely be an update then.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.alert-notice {
  background: #fffbeb;
  border-bottom: 3px solid #e5c44a;
  color: #6b5c10;
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
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ca8a04;
}

.alert-icon svg {
  width: 28px;
  height: 28px;
  stroke-width: 2;
}

.alert-text {
  flex: 1;
  min-width: 0;
}

.alert-title {
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-bold);
  color: #854d0e;
  margin: 0 0 var(--spacing-sm) 0;
  letter-spacing: -0.01em;

  small {
    font-size: var(--font-size-xs);
    font-weight: var(--font-weight-normal);
    margin-left: 10px;
  }
}

.alert-body {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.alert-body p {
  font-size: 19px;
  line-height: var(--line-height-relaxed);
  color: #713f12;
  margin: 0;
  max-width: 70%;
}

.alert-body strong {
  color: #422006;
  font-weight: var(--font-weight-bold);
}

/* Links in alert */
.alert-body a {
  color: #a16207;
  text-decoration: underline;
  border-bottom: none;
}

.alert-body a:hover {
  color: #713f12;
}

.alert-details {
  margin-top: var(--spacing-xs);
}

.details-toggle {
  cursor: pointer;
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-bold);
  color: #a16207;
  background: none;
  border: none;
  padding: 0;
  font-family: inherit;
}

.details-toggle:hover {
  color: #713f12;
}

.details-arrow {
  display: inline-block;
  transition: transform 0.25s ease;
}

.details-arrow.open {
  transform: rotate(90deg);
}

.details-content {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 0.3s ease;
}

.details-content.open {
  grid-template-rows: 1fr;
}

.details-inner {
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.details-inner p {
  font-size: var(--font-size-base);
  margin-top: var(--spacing-sm);
}

@media (max-width: 768px) {
  .alert-notice {
    padding: var(--spacing-md) 0;
  }

  .alert-icon {
    display: none;
  }

  .alert-title {
    font-size: var(--font-size-base);
  }

  .alert-body p {
    font-size: var(--font-size-sm);
    max-width: 100%;
  }
}
</style>
