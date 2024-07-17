<template>
    <header>
        <div class="wordmark">
            <Loama />
            <span>Loama</span>
        </div>
        <nav>
            <slot></slot>
            <LoButton :rightIcon="PhShareFat" class="share">Share access</LoButton>
        </nav>
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
import Loama from '../../assets/loama.svg'
import LoButton from '../LoButton.vue'
import HeaderContextMenu from './HeaderContextMenu.vue'
import { PhShareFat } from '@phosphor-icons/vue';
defineProps<{
    pfpSrc: string,
}>()

const isContextMenuHidden = ref(true)


function toggleContextMenu() {
    isContextMenuHidden.value = !isContextMenuHidden.value
}

</script>

<style scoped>
header,
.wordmark,
nav {
    display: flex;
    flex-flow: row nowrap;
}

.wordmark,
img {
    margin-bottom: calc(var(--base-unit));
}

header,
img {
    border: 0.25rem solid var(--solid-purple);
}

header {
    width: 100%;
    gap: calc(var(--base-unit)*5);
    border-radius: 0 0 var(--base-corner) var(--base-corner);
    border-bottom: 0.5rem solid var(--solid-purple);
    border-top: 0;
    padding: calc(var(--base-unit)*3) calc(var(--base-unit)*6) 0 calc(var(--base-unit)*3);
}

.wordmark>span {
    font-family: "JetBrains Mono";
    font-size: calc(var(--base-unit)*6);
    font-style: normal;
    font-weight: 700;
    line-height: normal;
    color: var(--solid-purple);
    text-transform: uppercase;
}

nav {
    flex-grow: 1;
    align-items: end;
}

.share {
    align-self: center;
    margin-left: auto;
}

svg {
    width: calc(var(--base-unit)*8);
    height: calc(var(--base-unit)*8);
}

img {
    border-radius: 100%;
    width: calc(var(--base-unit)*8);
}

.hidden {
    display: none;
}

.menu {
    position: absolute;
    right: var(--base-unit);
    top: calc(var(--base-unit)*14);
    min-width: fit-content;
    min-height: fit-content;
    max-width: 25vw;
    max-height: 50vw;
}
</style>