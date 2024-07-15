<template>
    <header>
        <div class="wordmark">
            <Loama />
            <h1>Loama</h1>
        </div>
        <nav>
            <slot></slot>
        </nav>
        <img :src="pfpSrc" alt="User profile picture"/>
    </header>
</template>

<style scoped>
    header, .wordmark {
        display: flex;
        flex-flow: row nowrap;
    }
    header {
        width: 100%;
        gap: var(--base-unit);
        border-radius: 0 0 0.5rem 0.5rem;
        border: 0.25rem solid var(--solid-purple);
        border-bottom: 0.5rem solid var(--solid-purple);
        border-top: 0;
        padding: calc(var(--base-unit)*3) calc(var(--base-unit)*6) 0 calc(var(--base-unit)*3);
    }
    h1 {
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
    }
    svg {
        width: calc(var(--base-unit)*8);
        height: calc(var(--base-unit)*8);
    }
    img {
        border-radius: 100%;
        border: 0.25rem solid var(--solid-purple);
        width: calc(var(--base-unit)*8);
    }
</style>

<script setup lang="ts">
import Loama from '../assets/loama.svg'
const props = defineProps<{
    pfpSrc: string
}>()
</script>