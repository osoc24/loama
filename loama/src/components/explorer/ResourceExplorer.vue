<template>
    <div class="panel-container">
        <div class="left-panel">
            <ExplorerBreadcrumbs />
            <ExplorerEntry v-for="thing in getViewFormattedThings(data)" :key="thing.url"
                :isContainer="thing.isContainer" :authProtected="false" :url="thing.name + '/'">{{ thing.name }}
            </ExplorerEntry>
        </div>
        <div class="right-panel">
            <img class="side-image" src="/vault.svg" />
            <strong>No folder or file selected!</strong>
            <i>Select one to get started</i>
        </div>
    </div>
</template>

<script setup lang="ts">
import { store } from "@/store";
import type { Session } from "@inrupt/solid-client-authn-browser";
import { getPod } from "loama-controller";
import { ref, watch } from "vue";
import { PhLock, PhLockOpen } from "@phosphor-icons/vue";
import ExplorerEntry from "./ExplorerEntry.vue";
import type { FormattedThing } from "loama-controller/dist/types";
import { useRoute } from "vue-router";
import ExplorerBreadcrumbs from "./ExplorerBreadcrumbs.vue";

const data = ref(await getThingsAtLevel(store.usedPod));
const route = useRoute();

const fileUrl = (path: string | string[]) => `${store.usedPod}${path}`

const uriToName = (uri: string, isContainer: boolean) => {
    const splitted = uri.split('/');

    return isContainer ? splitted[splitted.length - 2] : splitted[splitted.length - 1];
}

watch(() => route.params.filePath, async (path) => {
    data.value = await getThingsAtLevel(fileUrl(path)), { immediate: true }
})

async function getThingsAtLevel(url: string) {
    return (await getPod(store.session as Session, url)).things
        // Filter out the current resource
        .filter(thing => thing.url !== url)
        // Filter out the things that are nested (?)
        .filter(thing => {
            const depth = thing.url.replace(store.usedPod, '').split('/');
            return depth.length <= 2;
        })
}

function getViewFormattedThings(data: FormattedThing[]) {
    return data.map(thing => {
        const uri = thing.url.replace(store.usedPod, '');
        const isContainer = uri.charAt(uri.length - 1) === '/'
        const name = uriToName(uri, isContainer);
        const publicAccess = thing.accessModes.public.length > 0;
        return {
            isContainer,
            name,
            public: {
                access: publicAccess,
                icon: (publicAccess) ? PhLockOpen : PhLock
            },
            ...thing
        }
    })
}
</script>

<style scoped>
/* div {
    display: flex;
    flex-flow: column nowrap;
    align-items: center;
    gap: var(--base-unit);
    margin: calc(var(--base-unit)*2); */
/* } */
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
    gap: 2rem;
    flex: 3;
    padding: 2rem 2rem 0 2rem;
    background-color: var(--off-white);
}

.right-panel {
    flex: 2;
    background-color: var(--lama-gray);
    position: relative;
    justify-content: center;
    align-items: center;
}
</style>