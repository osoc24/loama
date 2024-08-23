import { getDefaultSession } from '@inrupt/solid-client-authn-browser'
import { reactive, markRaw } from 'vue'

export const store = reactive({
    session: markRaw(getDefaultSession()),
    usedPod: '',
    setUsedPod(url: string) {
        this.usedPod = url
    }
})
