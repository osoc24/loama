<template>
    <ul>
        <li v-for="thing in things" :key="thing.url">{{ thing.predicates }}</li>
    </ul>
</template>

<script setup lang="ts">
import { listThings } from "loama-controller";

const props = defineProps(['dataset'])
console.log(props.dataset)
const things = await listThings(props.dataset)
</script>