<template>
  <div>
    <h1>{{ title }}</h1>
    <h2 v-if="subtitle">{{ subtitle }}</h2>
  </div>
  <form @submit.prevent="login">
    <div class="input-group">
      <label for="solid-pod-url">Solid Pod URL</label>
      <input type="url" id="solid-pod-url" v-model="solidPodUrl" required placeholder="https://pod.pod/pod/card#me">
      <p v-if="showWarning" class="warning">Invalid Solid Pod URL. Please check and try again.</p>
    </div>
    <div class="btn-group">
      <button @click.prevent="setDefaultIdp" :disabled="isLoading" class="outlined">No Pod?</button>
      <button type="submit" :disabled="isLoading">
        <span v-if="isLoading">Loading...</span>
        <span v-else>Login</span>
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { store } from '@/store';

defineProps<{ title: string, subtitle?: string }>();

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
  font-family: Raleway;
  font-size: calc(var(--base-unit)*2);
  font-style: normal;
  font-weight: 300;
  line-height: normal;
}

h1,
h2 {
  text-align: center;
}

form {
  width: calc(100% - 4rem);
}

form div {
  margin-bottom: 4rem;
}

input[type="url"] {
  display: block;
  margin: 10px auto;
  padding: 10px;
  width: 100%;
  border: none;
  border-radius: 5px;
}

.btn-group {
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
