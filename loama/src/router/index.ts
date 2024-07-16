import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import LandingView from '@/views/LandingView.vue'
import { store } from '@/store'
import { listPods } from 'loama-controller'
import type { Session } from '@inrupt/solid-client-authn-browser'

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
    await store.session.handleIncomingRedirect();
    console.log(store.session.info)
    if(store.session.info.isLoggedIn){
      store.setUsedPod((await listPods(store.session as Session))[0])
    }
    if (!store.session.info.isLoggedIn && to.name !== 'landing') {
      return { name: 'landing' }
    }
  }
})

export default router
