import { createRouter, createWebHistory } from 'vue-router'

declare module 'vue-router' {
  interface RouteMeta {
    title?: string
    /** Room to leave above a #hash target */
    scrollOffset?: number
  }
}

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'dashboard', component: () => import('./views/DashboardView.vue') },
    {
      path: '/cameras',
      name: 'cameras',
      component: () => import('./views/CamerasView.vue'),
      // The sticky site chips cover the top of the page
      meta: { title: 'Construction cameras', scrollOffset: 64 },
    },
    // Old per-site links
    { path: '/cameras/:site', redirect: (to) => ({ name: 'cameras', hash: `#${to.params.site}` }) },
    { path: '/:rest(.*)*', redirect: '/' },
  ],
  scrollBehavior(to, from, saved) {
    if (saved) return saved
    if (to.hash) {
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      return { el: to.hash, top: to.meta.scrollOffset ?? 8, behavior: reduceMotion ? 'auto' : 'smooth' }
    }
    return to.path === from.path ? undefined : { top: 0 }
  },
})

// Per-page title and canonical URL (a single-page app has one index.html)
router.afterEach((to) => {
  document.title = to.meta.title ? `${to.meta.title} · hudson.tube` : 'hudson.tube Tunnel Tracker'
  document.querySelector('link[rel="canonical"]')?.setAttribute('href', `https://hudson.tube${to.path}`)
})
