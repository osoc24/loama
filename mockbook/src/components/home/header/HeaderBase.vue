<template>
    <header>
        <h1>{{ title }}</h1>
        <img :src="pfpSrc" alt="User profile picture" @click="toggleContextMenu" />
        <Suspense>
            <HeaderContextMenu class="menu" :class="{ hidden: isContextMenuHidden }" @click="toggleContextMenu" />
            <template #fallback>
                Loading context menu...
            </template>
        </Suspense>
    </header>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import HeaderContextMenu from './HeaderContextMenu.vue'
defineProps<{
    pfpSrc: string,
    title: string,
}>()

const isContextMenuHidden = ref(true)


function toggleContextMenu() {
    isContextMenuHidden.value = !isContextMenuHidden.value
}

</script>

<style scoped>
header {
    width: 100%;	
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    justify-content: space-between;
    align-items: center;
    background-color: var(--dark-blue);
    color: #ffffff;
    padding: 15px 30px;
}

img {
    border-radius: 50%;
    width: 3rem;
    height: 3rem;
    cursor: pointer;
}

.hidden {
    display: none;
}

.menu {
    position: absolute;
    right: var(--base-unit);
    top: calc(var(--base-unit)*8);
    min-width: fit-content;
    min-height: fit-content;
    max-width: 25vw;
    max-height: 50vw;
}
</style>