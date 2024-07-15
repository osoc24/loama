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
        <button @click="addReadmePermissions">Add README permissions</button>
    </div>
</template>

<script setup lang="ts">
import { store } from "@/store";
import type { Session } from "@inrupt/solid-client-authn-browser";
import { listPods, getOrCreateIndex, addPermissions } from "loama-controller";
import { Permission } from "loama-controller/dist/types";
import { ref } from "vue";

const pods = await listPods(store.session as Session);

const indexFile = ref(await getOrCreateIndex(store.session as Session, pods[0].pod)); // .then((index) => addPermissions(store.session, index, ["example.com"], true, [Permission.Read]))

// const pods = [await listPod(store.session, "https://css12.onto-deside.ilabt.imec.be/osoc5/")]

const addReadmePermissions = async () => indexFile.value = await addPermissions(store.session as Session, indexFile.value, ["https://css12.onto-deside.ilabt.imec.be/osoc1/README"], true, [Permission.Read, Permission.Write]);
</script>