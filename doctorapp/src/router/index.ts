import { createRouter, createWebHistory } from "vue-router";
import HomeView from "@/views/HomeView.vue";
import LoginView from "@/views/LoginView.vue";
import { listPodUrls } from "loama-common";
import { store } from 'loama-app'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "login",
      component: LoginView,
    },
    {
      path: "/home",
      name: "home",
      component: HomeView,
    },
  ],
});

router.beforeEach(async (to) => {
  if (!store.session.info.isLoggedIn) {
    await store.session.handleIncomingRedirect();
    if (store.session.info.isLoggedIn) {
      store.setUsedPod((await listPodUrls(store.session))[0]);
    }
    if (!store.session.info.isLoggedIn && to.name !== "login") {
      return { name: "login" };
    }
  }
});

export default router;
