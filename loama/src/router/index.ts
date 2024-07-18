import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import LoginView from '@/views/LoginView.vue'
import { store } from '@/store'
import { getPod, listPods } from 'loama-controller'
import type { Session } from '@inrupt/solid-client-authn-browser'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'login',
      component: LoginView
    },
    {
      path: '/home',
      name: 'home',
      component: HomeView
    }
  ]
})

router.beforeEach(async (to) => {
  if (!store.session.info.isLoggedIn) {
    await store.session.handleIncomingRedirect();
    if(store.session.info.isLoggedIn){
      store.setUsedPod((await listPods(store.session as Session))[0])
    }
    if (!store.session.info.isLoggedIn && to.name !== 'landing') {
      return { name: 'landing' }
    }
  }
})

export default router
