<template>
  <header>
    <h1>{{ title }}</h1>
    <p class="tagline" v-if="subtitle">{{ subtitle }}</p>
  </header>
  <form @submit.prevent="login">
    <fieldset>
      <legend>
        Solid Pod URL
        <PhQuestion :size="24" @mouseover="showPopup = true;" @mouseleave="showPopup = false" />
      </legend>
      <label for="solid-pod-url">
        <PhLink :size="24" class="icon" />
        <input type="url" id="solid-pod-url" v-model="solidPodUrl" :placeholder="defaultSolidPodUrl" />
      </label>
      <p v-if="showWarning" class="warning">Invalid Solid Pod URL. Please check and try again.</p>
    </fieldset>
    <fieldset>
      <LoButton @click.prevent="noPod" :disabled="isLoading" class="secondary" :left-icon="PhQuestion">
        No Pod?
      </LoButton>
      <LoButton type="submit" :disabled="isLoading" :right-icon="PhArrowRight">
        <span v-if="isLoading">Loading...</span>
        <span v-else>Login</span>
      </LoButton>
    </fieldset>
  </form>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { store } from '@/store';
import { PhArrowRight, PhLink, PhQuestion } from '@phosphor-icons/vue';
import LoButton from './LoButton.vue';

defineProps<{ title: string, subtitle?: string }>();

const showPopup = defineModel<boolean>('showPopup');

const emit = defineEmits<{
  toggleProvider: []
}>()

const solidPodUrl = ref<string>('');
const defaultSolidPodUrl = import.meta.env.VITE_DEFAULT_IDP;
const showWarning = ref<boolean>(false);
const isLoading = ref<boolean>(false);

const login = () => {
  isLoading.value = true;
  const issuer = solidPodUrl.value.trim() || defaultSolidPodUrl;

  store.session.login({
    oidcIssuer: issuer,
    redirectUrl: new URL('/home', window.location.href).toString(),
    clientName: 'LOAMA',
  })
    .then(() => {
      showWarning.value = false;
      isLoading.value = false;
    })
    .catch(() => {
      showWarning.value = true;
      isLoading.value = false;
    });
};

const noPod = () => {
  emit('toggleProvider');
};
</script>

<style scoped>
.tagline {
  color: var(--off-black);
  font-size: calc(var(--base-unit)*4);
  font-style: normal;
  font-weight: 600;
  line-height: normal;
}

legend {
  display: flex;
  justify-content: space-between;
  width: 100%;
}

span {
  display: flex;
  flex-direction: row;
  justify-content: center;
  font-weight: 700;
  gap: var(--base-unit);
}

label {
  display: flex;
  position: relative;
  flex-grow: 1;
}

.icon {
  position: absolute;
  left: var(--base-unit);
  top: 50%;
  margin-top: calc(-1 * var(--base-unit));
}

input[type="url"] {
  padding: 1rem calc(var(--base-unit) + 24px);
  width: 100%;
  border-color: var(--off-black);
  border-radius: var(--base-corner);
}

.warning {
  color: red;
}

.loading {
  color: blue;
}

label,
p,
input {
  color: var(--off-black, #170D33);
}

h1,
h2 {
  text-align: center;
}

form {
  width: 100%;
}

form div {
  margin-bottom: 4rem;
}

fieldset {
  border: none;
}

fieldset:has(button) {
  display: flex;
  justify-content: space-between;
}

button {
  width: 45%;
  justify-content: center;
}
</style>
