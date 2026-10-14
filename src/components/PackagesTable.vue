<script setup lang="ts">
import { constructionPackages } from '../assets/data'

const money = (n: number) => (n >= 1e9 ? `$${(n / 1e9).toFixed(2)}B` : `$${(n / 1e6).toFixed(1)}M`)
</script>

<template>
  <div class="table-scroll">
    <table class="packages">
      <thead>
        <tr>
          <th scope="col">Package</th>
          <th scope="col" class="who">Contractor</th>
          <th scope="col" class="num"><span class="long">Jobs supported</span><span class="short">Jobs</span></th>
          <th scope="col" class="num">Budget</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="pkg in constructionPackages" :key="pkg.name">
          <th scope="row">
            {{ pkg.name }}
            <span v-if="pkg.complete" class="done">✓ Complete</span>
            <span class="who-inline">{{ pkg.contractor }}</span>
          </th>
          <td class="who">{{ pkg.contractor }}</td>
          <td class="num">
            <template v-if="pkg.jobs">{{ pkg.jobs.toLocaleString('en-US') }}</template>
            <span v-else class="unknown">unknown</span>
          </td>
          <td class="num">{{ money(pkg.budget) }}</td>
        </tr>
      </tbody>
    </table>
  </div>
  <p class="note">
    Budget is the board-approved estimate for the whole package, including
    contingency. Jobs are full-time-equivalent jobs supported over the contract, from GDC's economic model (Jan 2026),
    not people on site today.
  </p>
</template>

<style scoped>
.table-scroll {
  overflow-x: auto;
}

.packages {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

th,
td {
  padding: 9px 8px;
  border-bottom: 1px solid var(--color-line);
  text-align: left;
  vertical-align: middle;
}

thead th {
  padding-top: 4px;
  border-bottom-color: var(--color-border);
  font-size: 11px;
  font-weight: var(--font-weight-semibold);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-text-secondary);
  white-space: nowrap;
}

tbody th {
  font-weight: var(--font-weight-medium);
}

.who {
  color: var(--color-text-secondary);
}

/* Narrow screens: the contractor moves under the package name */
.who-inline,
.short {
  display: none;
}

@media (max-width: 640px) {
  .who {
    display: none;
  }
  .long {
    display: none;
  }
  .short {
    display: inline;
  }
  th,
  td {
    padding-left: 5px;
    padding-right: 5px;
  }
  .who-inline {
    display: block;
    font-size: 13px;
    font-weight: var(--font-weight-normal);
    color: var(--color-text-secondary);
  }
  .packages {
    font-size: 13px;
  }
}

.num {
  text-align: right;
  font-family: var(--font-family-mono);
  font-size: 13px;
  white-space: nowrap;
}

thead .num {
  font-family: var(--font-family-base);
  font-size: 11px;
}

.unknown {
  color: var(--color-text-tertiary);
}

.done {
  margin-left: 8px;
  font-size: 12px;
  font-weight: var(--font-weight-bold);
  color: var(--color-ok);
  white-space: nowrap;
}

.note {
  margin-top: 10px;
  font-size: 12px;
  line-height: 1.5;
  color: var(--color-text-tertiary);
}
</style>
