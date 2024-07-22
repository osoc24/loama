<template>
    <div>
        <button class="file">
            <component :is="icon" :size="40" />
            <span>
                <slot></slot>
            </span>
        </button>
        <RouterLink :to="props.url">
            <LoButton v-if="isContainer" :right-icon="PhArrowRight" class="view">View files
            </LoButton>
        </RouterLink>
    </div>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router';
import LoButton from "../LoButton.vue";
import { PhFolder, PhFile, PhArrowRight } from '@phosphor-icons/vue';

const props = defineProps<{
    url: string,
    isContainer: boolean,
    authProtected: boolean
}>()

const icon = props.isContainer ? PhFolder : PhFile;
</script>

<style lang="css" scoped>
div {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
}

a {
    text-decoration: none;
}

.file {
    display: flex;
    flex: 0 1 auto;
    flex-flow: row nowrap;
    align-items: center;
    gap: var(--base-unit);
    background-color: #0000;
    border: none;
    width: 100%;
    color: var(--off-black);
}

.view {
    width: calc(var(--base-unit)*20)
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