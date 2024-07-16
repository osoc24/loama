<template>
    <aside>
        <span>{{ store.usedPod }}</span>
        <label for="pod">Selected Pod</label>
        <select>
            <option v-for="pod in pods" :key="pod">{{ pod }}</option>
        </select>
        <button @click.prevent="logout">Sign out</button>
    </aside>
</template>

<script setup lang="ts">
import router from '@/router';
import { store } from '@/store';
import type { Session } from '@inrupt/solid-client-authn-browser';
import { listPods } from 'loama-controller';
const pods = await listPods(store.session as Session);

async function logout() {
    store.session.logout();
    router.push('/'); 
}
</script>

<style lang="css" scoped>
aside {
    border-radius: 0.5rem;
    color: var(--off-white);
}
span {
    background-color: var(--solid-purple);
    color: var(--off-white);
    font-family: Raleway;
    font-size: 24px;
    font-style: normal;
    font-weight: 700;
    line-height: normal;
}

</style>