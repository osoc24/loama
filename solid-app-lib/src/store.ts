import { getDefaultSession, Session } from '@inrupt/solid-client-authn-browser'
import { reactive } from 'vue'

type storeType = {
  session: Session,
  usedPod: string,
  setUsedPod: (url: string) => void
}

export const store = reactive({
  session: getDefaultSession(),
  usedPod: '',
  setUsedPod(url: string) {
    this.usedPod = url
  }
} as storeType)
