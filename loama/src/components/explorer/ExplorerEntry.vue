<template>
    <div>
        <ExplorerEntity :is-container="isContainer" class="file">
            <slot></slot>
        </ExplorerEntity>
        <RouterLink :to="props.url">
            <LoButton v-if="isContainer" :right-icon="PhArrowRight" class="view">View files
            </LoButton>
        </RouterLink>
    </div>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router';
import { PhArrowRight } from '@phosphor-icons/vue';

import LoButton from "../LoButton.vue";
import ExplorerEntity from './ExplorerEntity.vue';

const props = defineProps<{
    url: string,
    isContainer: boolean,
    authProtected: boolean
}>()
</script>

<style lang="css" scoped>
div {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
}

div:hover {
    background-color: color-mix(in srgb, var(--off-black) 80%, transparent);
    border-radius: var(--base-corner);
}

a {
    text-decoration: none;
}

.view {
    width: calc(var(--base-unit)*20)
}

.file {
    color: var(--off-black);
    cursor: context-menu;
}

.file:hover {
    color: var(--off-white);
}
</style>