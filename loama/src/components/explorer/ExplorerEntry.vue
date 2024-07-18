<template>
    <button>
        <component :is="icon" :size="40" />
        <span><slot></slot></span>
    </button>
</template>

<script setup lang="ts">
import { defineProps } from 'vue';
defineProps<{
    icon: object,
    authProtected: boolean
}>()
</script>

<style lang="css" scoped>
    button {
        display: flex;
        flex-flow: row nowrap;
        align-items: center;
        gap: var(--base-unit);
        background-color: #0000;
        border: none;
        gap: var(--base-unit);
        width: 100%;
        color: var(--off-black);
    }

    span {
        font-size: calc(var(--base-unit)*3);
        font-style: normal;
        font-weight: 700;
        line-height: normal;
        flex-grow: 1;
        text-align: start;
    }
</style>