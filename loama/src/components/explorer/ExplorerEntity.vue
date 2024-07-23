<template>
    <div>
        <component :is="isContainer ? PhFolder : PhFile" :size="40" />
        <span>
            <slot></slot>
        </span>
    </div>
</template>

<script setup lang="ts">
import { PhFolder, PhFile } from '@phosphor-icons/vue';

defineProps<{
    isContainer: boolean,
}>()
</script>

<style scoped>
div {
    display: flex;
    flex: 0 1 auto;
    flex-flow: row nowrap;
    align-items: center;
    gap: var(--base-unit);
    background-color: #0000;
    border: none;
    width: 100%;
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