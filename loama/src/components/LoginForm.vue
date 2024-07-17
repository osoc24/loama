<template>
  <header>
    <h1>{{ title }}</h1>
    <p class="tagline" v-if="subtitle">{{ subtitle }}</p>
  </header>
  <form @submit.prevent="login">
    <fieldset>
      <legend>Solid Pod URL
        <PhQuestion :size="24" @mouseover="showPopup = true;" @mouseleave="showPopup = false" />
      </legend>
      <label for="solid-pod-url">
        <PhLink :size="24" class="icon" />
        <input type="url" id="solid-pod-url" v-model="solidPodUrl" required placeholder="https://pod.pod/pod/card#me" />
      </label>
      <p v-if="showWarning" class="warning">Invalid Solid Pod URL. Please check and try again.</p>
    </fieldset>
    <fieldset>
      <button @click.prevent="setDefaultIdp" :disabled="isLoading" class="outlined">
        <PhQuestion :size="24" /> No Pod?
      </button>
      <button type="submit" :disabled="isLoading">
        <span v-if="isLoading">Loading...</span>
        <span v-else>Login
          <PhArrowRight :size="24" />
        </span>
      </button>
    </fieldset>
  </form>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { store } from '@/store';
import { PhArrowRight, PhLink, PhQuestion } from '@phosphor-icons/vue';

defineProps<{ title: string, subtitle?: string }>();

const showPopup = defineModel<boolean>('showPopup');

const emit = defineEmits<{
  toggleProvider: []
}>()

const solidPodUrl = ref<string>('');
const idp = ref<string>('https://css12.onto-deside.ilabt.imec.be/');
const showWarning = ref<boolean>(false);
const isLoading = ref<boolean>(false);

const login = () => {
  isLoading.value = true;
  const issuer = solidPodUrl.value.trim() || idp.value;

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

const setDefaultIdp = () => {
  idp.value = 'https://css12.onto-deside.ilabt.imec.be/';
  emit('toggleProvider');
};
</script>

<style scoped>
.tagline {
  color: var(--Off-Black, #170D33);
  font-family: Raleway;
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

button,
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
  color: var(--Off-Black, #170D33);
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
  width: 100%;
  display: flex;
  justify-content: space-between;
}

button {
  width: 45%;
  background-color: var(--solid-purple);
  color: var(--off-white);
  border: none;
  cursor: pointer;
  border-radius: var(--base-corner);
  padding: 10px;
}

.outlined {
  border: 2px solid var(--solid-purple);
  background-color: var(--off-white);
  color: var(--off-black);
}

button[disabled] {
  background-color: grey;
  cursor: not-allowed;
}

button:hover:not([disabled]) {
  background-color: var(--off-black);
  border-color: var(--off-black);
  color: var(--off-white);
}
</style>
