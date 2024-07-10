<template>
    <div>
        Pods:
        <dl>
            <template v-for="pod in pods" :key="pod.pod">
                <dt>{{ pod.pod }}</dt>
                <dd>
                    <table>
                        <thead>
                            <th>URL</th>
                            <th>Properties</th>
                            <th>Access Modes</th>
                        </thead>
                        <tbody>
                            <tr v-for="thing in pod.things" :key="thing.url">
                                <td>{{ thing.url }}</td>
                                <td>
                                    <ul>
                                        <li v-for="property in thing.properties" :key="property">{{ property }}</li>
                                    </ul>
                                </td>
                                <td>
                                    {{ thing.accessModes }}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </dd>
            </template>
        </dl>
    </div>
</template>

<script setup lang="ts">
import { store } from "@/store";
import { listPods, listPod } from "loama-controller";

const pods = await listPods(store.session);

// const pods = [await listPod(store.session, "https://css12.onto-deside.ilabt.imec.be/osoc5/")]
</script>