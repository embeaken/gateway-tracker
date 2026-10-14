import { createRouter, createWebHistory } from 'vue-router'

const SITE = 'hudson.tube'
const DEFAULT_TITLE = 'hudson.tube Tunnel Tracker'

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'dashboard', component: () => import('./views/DashboardView.vue') },
    {
      path: '/cameras',
      name: 'cameras',
      component: () => import('./views/CamerasView.vue'),
      // The sticky site chips cover the top of the page
      meta: {
        scrollOffset: 64,
        title: 'Construction cameras',
      },
    },
    // Old per-site links
    { path: '/cameras/:site', redirect: (to) => ({ name: 'cameras', hash: `#${to.params.site}` }) },
    { path: '/:rest(.*)*', redirect: '/' },
  ],
  scrollBehavior: (to, from, saved) =>
    saved ?? (to.hash ? { el: to.hash, top: (to.meta.scrollOffset as number | undefined) ?? 8, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' } : to.path === from.path ? undefined : { top: 0 }),
})

// Per-page title and canonical URL (a single-page app has one index.html)
router.afterEach((to) => {
  const title = to.meta.title as string | undefined
  document.title = title ? `${title} · ${SITE}` : DEFAULT_TITLE
  document.querySelector('link[rel="canonical"]')?.setAttribute('href', `https://hudson.tube${to.path}`)
})
