import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import PrimeVue from "primevue/config";
import Tooltip from 'primevue/tooltip';
import Lara from "@primevue/themes/lara";
import { definePreset } from '@primevue/themes';
import ToastService from 'primevue/toastservice';
import ConfirmationService from 'primevue/confirmationservice';

const app = createApp(App)

// TODO be able to rebuild index? or update index based on real-world access config?

const LoamaPreset = definePreset(Lara, {
    semantic: {
        primary: {
            50: '{indigo.50}',
            100: '{indigo.100}',
            200: '{indigo.200}',
            300: '{indigo.300}',
            400: '{indigo.400}',
            500: '{indigo.500}',
            600: '{indigo.600}',
            700: '{indigo.700}',
            800: '{indigo.800}',
            900: '{indigo.900}',
            950: '{indigo.950}'
        }
    },
})

app.use(router)
app.directive('tooltip', Tooltip);
app.use(PrimeVue, {
    theme: {
        preset: LoamaPreset,
        options: {
            darkModeSelector: "",
        },
    }
});
app.use(ToastService);
app.use(ConfirmationService);

app.mount('#app')
