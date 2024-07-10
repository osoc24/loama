import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import LandingView from '@/views/LandingView.vue'
import { store } from '@/store'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'landing',
      component: LandingView
    },
    {
      path: '/home',
      name: 'home',
      component: HomeView
    }
  ]
})

router.beforeEach(async (to) => {
  console.log(store.session.info)
  if (!store.session.info.isLoggedIn) {
    await store.session.handleIncomingRedirect()

    if (!store.session.info.isLoggedIn && to.name !== 'landing') {
      return { name: 'landing' }
    }
  }
})

export default router
