<template>
    <div>
        Pods:
        <dl>
            <div v-for="pod in pods" :key="pod.pod">
                <dt>{{ pod.pod }}</dt>
                <dd>
                    <dl>
                        <div v-for="thing in pod.things" :key="thing.url">
                            <dt>{{ thing.url }}</dt>
                            <dd>{{ thing.properties }}</dd>
                        </div>
                    </dl>
                </dd>
            </div>
        </dl>
    </div>
</template>

<script setup lang="ts">
import { store } from "@/store";
import { listPods } from "loama-controller";

const pods = await listPods(store.session);
</script>