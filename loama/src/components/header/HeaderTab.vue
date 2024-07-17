<template>
    <a :href="href" :class="{ active: active }"><slot/></a>
</template>

<script setup lang="ts">
const props = defineProps<{
    href: string
    active: boolean
}>()
</script>

<style scoped>
a {
    background-color: var(--lama-gray);
    display: inline-block;
    text-decoration: none;
    display: flex;
    justify-content: center;
    align-items: center;
    font-weight: 700;
    font-size: calc(var(--base-unit)*3);
    min-height: calc(var(--base-unit)*8);
    border-radius: var(--base-corner) var(--base-corner) 0 0;
    min-width: calc(var(--base-unit)*15);
}

.active {
    background-color: var(--solid-purple);
    color: var(--off-white);
}
</style>