<template>
    <div>
        Pods:
        <ul>
            <li v-for="pod in pods" :key="pod">{{ pod }}</li>
        </ul>
    </div>
</template>

<script setup lang="ts">
import { store } from "@/store";
import { listPods } from "loama-controller";

const pods = await listPods(store.session);
</script>