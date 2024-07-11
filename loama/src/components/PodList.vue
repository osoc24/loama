<template>
    <div>
        <h2>Pods:</h2>
        <template v-for="pod in pods" :key="pod.pod">
            <h4>{{ pod.pod }}</h4>
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
            <h4>{{ `${pod.pod}index.json` }}</h4>
            {{ indexFile }}
        </template>
    </div>
</template>

<script setup lang="ts">
import { store } from "@/store";
import { listPods, getOrCreateIndex, addPermissions } from "loama-controller";
import { Permission } from "loama-controller/dist/types";

const pods = await listPods(store.session);

const indexFile = await getOrCreateIndex(store.session, pods[0].pod); // .then((index) => addPermissions(store.session, index, ["example.com"], true, [Permission.Read]))
// const indexFile = await getOrCreateIndex(store.session, pods[0].pod).then((index) => addPermissions(store.session, index, ["https://css12.onto-deside.ilabt.imec.be/osoc1/README"], true, [Permission.Read, Permission.Write]))

// const pods = [await listPod(store.session, "https://css12.onto-deside.ilabt.imec.be/osoc5/")]
</script>