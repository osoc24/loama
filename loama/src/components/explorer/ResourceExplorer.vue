<template>
    <div>
        <ExplorerEntry v-for="thing in resource" :key="thing.url" :icon="thing.icon" :authProtected="false">{{thing.name}}</ExplorerEntry>
    </div>
</template>

<script setup lang="ts">
import { store } from "@/store";
import type { Session } from "@inrupt/solid-client-authn-browser";
import { listPods, getPod } from "loama-controller";
import { ref } from "vue";
import { PhFolder, PhFile } from "@phosphor-icons/vue";
import ExplorerEntry from "./ExplorerEntry.vue";

const resource = ref(await getTopLevelThings());

/**
 * TODO: This function causes the icons to be re-active, so we'll need to extract the format function to a separate function
 */
async function getTopLevelThings(){
    const content = (await getPod(store.session as Session, store.usedPod || (await listPods(store.session as Session))[0])).things
        .filter(thing => thing.url !== store.usedPod)
        .filter(thing => {
            const depth = thing.url.replace(store.usedPod, '').split('/');
            return depth.length <= 2;
        })
    return content
        .map(thing => {
            const uri = thing.url.replace(store.usedPod, '');
            const depth = uri.split('/').length;
            console.log(thing.accessModes);
            return {
                icon: (depth === 2) ? PhFolder : PhFile,
                name: uri.replace('/', ''),
                ...thing
            }
        })
}
</script>

<style scoped>
    div {
        display: flex;
        flex-flow: column nowrap;
        align-items: center;
        gap: var(--base-unit);
        margin: calc(var(--base-unit)*2);
    }
</style>