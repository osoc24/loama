import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import LoginView from '@/views/LoginView.vue'
import RequestView from '@/views/RequestView.vue'
import { store } from 'loama-app'
import { listPodUrls } from 'loama-common'
import { activeController } from 'loama-controller'
import HeaderLayout from '@/components/layouts/HeaderLayout.vue'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: `/`,
            name: 'login',
            component: LoginView
        },
        {
            path: "/",
            component: HeaderLayout,
            children: [
                {
                    path: `/home/:filePath(.*)`,
                    name: 'home',
                    component: HomeView
                },
                {
                    path: "/request",
                    name: "request",
                    component: RequestView,
                }
            ]
        }
    ]
})

router.beforeEach(async (to) => {
    if (!store.session.info.isLoggedIn) {
        await store.session.handleIncomingRedirect({
            restorePreviousSession: true,
        })
        if (store.session.info.isLoggedIn) {
            // Default to the first pod
            const currentPodUrl = (await listPodUrls(store.session))[0]
            activeController.setPodUrl(currentPodUrl);
            store.setUsedPod(currentPodUrl)
        }
        if (!store.session.info.isLoggedIn && to.name !== 'login') {
            return { name: 'login' }
        }
    }
})

export default router
