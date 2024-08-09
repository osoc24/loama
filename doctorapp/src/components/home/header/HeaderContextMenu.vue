<template>
    <aside>
        <p>
            Current Pod:
            <span>{{ store.usedPod }}</span>
        </p>
        <div>
            <label for="pod">Select Pod</label>
        <select>
            <option v-for="pod in pods" :key="pod">{{ pod }}</option>
        </select>
        </div>
        <a @click.prevent="logout">
            <PhSignOut/>
            <span>Sign out</span>
        </a>
    </aside>
</template>

<script setup lang="ts">
import router from '@/router';
import { store } from 'loama-app'
import { PhSignOut } from '@phosphor-icons/vue';
import { listPodUrls } from 'loama-common';
const pods = await listPodUrls(store.session);

async function logout() {
    store.session.logout();
    router.push('/'); 
}
</script>

<style lang="css" scoped>
aside {
    border-radius: 0.5rem;
    display: flex;
    flex-flow: column nowrap;
    border: 0.25rem solid #008307;
    background-color: var(--off-white);
}
aside > p {
    padding: var(--base-unit);
    display: flex;
    flex-direction: column;
    font-weight: bold;
    color: black;
}
aside > p span {
    font-weight: normal;
}
aside > div {
    padding: var(--base-unit);
}
label {
    color: var(--off-black);
    font-weight: 700;
    display: block;
}
select {
    margin-bottom: var(--base-unit);
    cursor: pointer;
}
aside > span {
    background-color: #008307;
    color: var(--off-white);
    font-family: Raleway;
    font-style: normal;
    font-weight: 700;
    line-height: normal;
    padding: var(--base-unit);
    margin-bottom: var(--base-unit);
}

a {
    display: flex;
    flex-flow: row nowrap;
    background-color: var(--lama-gray);
    padding: var(--base-unit);
    gap: var(--base-unit);
    align-items: center;
    font-style: normal;
    font-weight: 700;
    cursor: pointer;
}
</style>