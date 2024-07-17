<template>
    <div>
        <h2>Pods:</h2>
        
        <button @click="addReadmePermissions">Add README permissions</button>
        <button @click="removeReadmePermissions">Revoke README permissions</button>
    </div>
</template>

<script setup lang="ts">
import { store } from "@/store";
import type { Session } from "@inrupt/solid-client-authn-browser";
import { listPods, getOrCreateIndex, addPermissions, removePermissions } from "loama-controller";
import { Permission } from "loama-controller/dist/types";
import { ref } from "vue";

const pods = await listPods(store.session as Session);
const indexFile = ref(await getOrCreateIndex(store.session as Session, pods[0])); // .then((index) => addPermissions(store.session, index, ["example.com"], true, [Permission.Read]))

// const pods = [await listPod(store.session, "https://css12.onto-deside.ilabt.imec.be/osoc5/")]

const addReadmePermissions = async () => indexFile.value = await addPermissions(store.session as Session, indexFile.value, ["https://css12.onto-deside.ilabt.imec.be/osoc1/README"], undefined, [Permission.Write]);
// const removeReadmePermissions = () => console.log(indexFile.value.items[0].id)
const removeReadmePermissions = async () => indexFile.value = await removePermissions(store.session as Session, indexFile.value, indexFile.value.items[0].id);
</script>
