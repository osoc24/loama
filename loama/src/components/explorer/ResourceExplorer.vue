<template>
   <p>Test</p>
</template>

<script setup lang="ts">
import { store } from "@/store";
import type { Session } from "@inrupt/solid-client-authn-browser";
import { listPods, getOrCreateIndex } from "loama-controller";
import { ref } from "vue";

const pods = await listPods(store.session as Session);
const indexFile = ref(await getOrCreateIndex(store.session as Session, pods[0])); // .then((index) => addPermissions(store.session, index, ["example.com"], true, [Permission.Read]))
</script>