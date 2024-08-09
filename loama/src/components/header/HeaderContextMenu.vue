<template>
    <aside>
        <span>{{ store.usedPod }}</span>
        <div>
            <label for="pod">Selected Pod</label>
            <select>
                <option v-for="pod in pods" :key="pod">{{ pod }}</option>
            </select>
        </div>
        <a @click.prevent="logout">
            <PhSignOut />
            <span>Sign out</span>
        </a>
    </aside>
</template>

<script setup lang="ts">
import router from '@/router';
import { store } from 'loama-app'
import { PhSignOut } from '@phosphor-icons/vue';
import { listPodUrls } from 'loama-common';
import { unsetPodUrl } from 'loama-controller';
const pods = await listPodUrls(store.session);

async function logout() {
    unsetPodUrl();
    store.session.logout();
    router.push('/');
}
</script>

<style lang="css" scoped>
aside {
    z-index: 10;
    border-radius: 0.5rem;
    display: flex;
    flex-flow: column nowrap;
    border: 0.25rem solid var(--solid-purple);
    background-color: var(--off-white);
}

aside>div {
    padding: var(--base-unit);
}

label {
    color: var(--off-black);
    font-weight: 700;
    display: block;
}

select {
    margin-bottom: var(--base-unit);
}

aside>span {
    background-color: var(--solid-purple);
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
}
</style>