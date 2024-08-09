import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

const app = createApp(App)

// TODO be able to rebuild index? or update index based on real-world access config?

app.use(router)

app.mount('#app')
