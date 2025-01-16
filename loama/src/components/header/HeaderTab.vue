<template>
    <RouterLink :to="href" activeClass="active">
        <slot />
    </RouterLink>
</template>

<script setup lang="ts">
defineProps<{
    href: string
    active: boolean
}>()
</script>

<style scoped>
a {
    background-color: var(--lama-gray);
    color: var(--off-black);
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
    padding: 0 calc(var(--base-unit)*3);
}

.active {
    background-color: var(--solid-purple);
    color: var(--off-white);
}
</style>
