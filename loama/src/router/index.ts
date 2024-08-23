import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import LoginView from '@/views/LoginView.vue'
import { store } from 'loama-app'
import { listPodUrls } from 'loama-common'
import { inruptController } from 'loama-controller'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: `/`,
            name: 'login',
            component: LoginView
        },
        {
            path: `/home/:filePath(.*)`,
            name: 'home',
            component: HomeView
        }
    ]
})

router.beforeEach(async (to) => {
    if (!store.session.info.isLoggedIn) {
        await store.session.handleIncomingRedirect()
        if (store.session.info.isLoggedIn) {
            // Default to the first pod
            const currentPodUrl = (await listPodUrls(store.session))[0]
            inruptController.setPodUrl(currentPodUrl);
            store.setUsedPod(currentPodUrl)
        }
        if (!store.session.info.isLoggedIn && to.name !== 'login') {
            return { name: 'login' }
        }
    }
})

export default router
