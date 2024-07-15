<template>
    <a :href="href" :class={active && "active"}><slot/></a>
</template>

<style scoped>
.active {
    background-color: var(--solid-purple);
    color: var(--off-white);
}

a {
    background-color: var(--lama-gray);
}
</style>

<script setup lang="ts">
const props = defineProps<{
    href: string
    active: boolean
}>()
</script>