import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

const app = createApp(App)

// TODO be able to rebuild index

app.use(router)

app.mount('#app')
