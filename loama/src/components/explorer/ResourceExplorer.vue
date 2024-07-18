<template>
    <div>
        <ExplorerEntry v-for="thing in getViewFormattedThings(data)" :key="thing.url" :icon="thing.icon" :authProtected="false">{{thing.name}}</ExplorerEntry>
    </div>
</template>

<script setup lang="ts">
import { store } from "@/store";
import type { Session } from "@inrupt/solid-client-authn-browser";
import { listPods, getPod } from "loama-controller";
import { ref } from "vue";
import { PhFolder, PhFile } from "@phosphor-icons/vue";
import ExplorerEntry from "./ExplorerEntry.vue";
import type { FormattedThing } from "loama-controller/dist/types";

const data = ref(await getTopLevelThings());

async function getTopLevelThings(){
    const podUrl = (store.usedPod)
        ? store.usedPod
        : (await listPods(store.session as Session))[0]
    return (await getPod(store.session as Session, podUrl)).things
        .filter(thing => thing.url !== store.usedPod)
        .filter(thing => {
            const depth = thing.url.replace(store.usedPod, '').split('/');
            return depth.length <= 2;
        })
}

function getViewFormattedThings(data: FormattedThing[]) {
    console.log(data);
    return data.map(thing => {
            const uri = thing.url.replace(store.usedPod, '');
            const depth = uri.split('/').length;
            console.log(thing.accessModes.public);
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