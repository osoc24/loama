<template>
    <div class="panel-container">
        <div class="left-panel">
            <ExplorerBreadcrumbs />
            <ExplorerEntry v-for="resource in podStore.formattedEntries" :key="resource.resourceUrl"
                @click="changeSelectedEntry(resource)" :isContainer="resource.isContainer" :authProtected="false"
                :url="resource.name + '/'">{{ resource.name }}

            </ExplorerEntry>
        </div>
        <div class="right-panel">
            <div class="default-panel-container" v-if="!podStore.selectedEntry">
                <div class="default-panel">
                    <img class="side-image" src="/vault.svg" />
                    <p><strong>No (container) resource selected!</strong></p>
                    <i>Select one to get started</i>
                </div>
            </div>
            <SelectedEntry v-else />
        </div>
    </div>
</template>

<script setup lang="ts">
import { store } from 'loama-app'
import { onMounted, watch } from "vue";
import ExplorerEntry from "./ExplorerEntry.vue";
import { useRoute } from "vue-router";
import ExplorerBreadcrumbs from "./ExplorerBreadcrumbs.vue";
import type { Entry } from "@/lib/types";
import { usePodStore } from '@/lib/state';
import SelectedEntry from './SelectedEntry.vue';

const route = useRoute();
const podStore = usePodStore();

await podStore.loadResources(store.usedPod)

const changeSelectedEntry = (entry: Entry) => podStore.selectedEntry = entry;

const fileUrl = (path: string | string[]) => `${store.usedPod}${path}`

watch(() => route.params.filePath, async (path) => {
    podStore.selectedEntry = null;
    podStore.loadResources(fileUrl(path));
})

</script>

<style scoped>
.side-image {
    margin-bottom: calc(var(--base-unit)*2);
}

strong {
    color: var(--off-black-50, rgba(23, 13, 51, 0.50));
    text-align: center;
    font-size: 16px;
    font-weight: 700;
}

i {
    color: var(--off-black-50, rgba(23, 13, 51, 0.50));
    text-align: center;
    font-size: 16px;
    font-style: italic;
    font-weight: 400;
}

.panel-container {
    display: flex;
    height: calc(100vh - var(--base-unit)*13);
    width: 100vw;
}

.left-panel,
.right-panel {
    display: flex;
    height: 100%;
    flex-direction: column;
}

.left-panel {
    gap: 1.5rem;
    flex: 3;
    padding: 2rem 1.5rem 0 2rem;
    background-color: var(--off-white);
    border-right: 0.25rem solid var(--solid-purple);
}

.right-panel {
    flex: 2;
}

.default-panel-container {
    padding-left: 0.5rem;
    width: 100%;
    height: 100%;
    background-color: var(--lama-gray);
    justify-content: center;
    align-items: center;
    display: flex;
}

.default-panel {
    align-items: center;
    display: flex;
    flex-direction: column;
}
</style>
