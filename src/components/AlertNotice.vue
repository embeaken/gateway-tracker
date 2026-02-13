<script setup lang="ts">
//import { ref } from 'vue'

//const detailsOpen = ref(false)
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
          <h3 class="alert-title">Project Funding Update<small>Last updated: February 13 at 6:18pm</small></h3>
          <div class="alert-body">
            <p>
              <strong>The vibes are good!</strong>
              The DOT has been <a href="https://www.nydailynews.com/2026/02/12/federal-funds-set-to-flow-again-for-hudson-river-tunnel-project-at-least-for-now" target="_blank">forced</a> to release $205 million to Gateway,
              which is <a href="https://www.nytimes.com/2026/02/13/nyregion/gateway-tunnel-funding-ny-nj-trump.html" target="_blank">expected</a> to be disbursed fully next week.
              GDC <a href="https://www.gatewayprogram.org/wp-content/uploads/2026/02/GDC-Statement-on-Initial-Disbursement-of-Federal-Funds.pdf" target="_blank">says</a> they have the first $30 million already.
            </p>
            <p>
              Despite this victory, <strong>funding is still frozen</strong> beyond the $205 million already owed.
              This is being fought in a <a href="https://www.nj.gov/governor/news/2026/approved/20260203a.shtml" target="_blank">separate lawsuit filed by GDC</a>,
              as well as the ongoing NY/NJ lawsuit that won these initial disbursements.
            </p>
            <p>
              <strong>Gateway has not yet announced a plan to restart construction, which remains paused as of February 6.</strong>
            </p>
            <!--<div class="alert-details">
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
                    the government to stop withholding disbursements while the <a href="https://ag.ny.gov/press-release/2026/attorney-general-james-sues-trump-administration-freezing-gateway-programs" target="_blank">case</a> plays out in court.
                    The Trump administration appealed this decision to the 2nd Circuit Court of Appeals, and also asked them to extend the stay in the original order.
                    The 2nd Circuit has until February 12th at 5pm to consider the appeal.
                  </p>
                  <p>
                    <em>Disclaimer: I am not a lawyer so don't take my legal interpretation as fact. I just aggregate sources I trust and try to summarize them as best I can, with occasional help from AI (fact-checked by me) to unpack the legalese.</em>
                  </p>
                </div>
              </div>
            </div>-->
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
