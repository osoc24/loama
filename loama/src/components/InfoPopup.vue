<template>
    <div>
        <h3>Identity Provider URL</h3>
        <p>A URL that links to the pod that you want to use.</p>
        <aside>
            <PhQuestion :size="24" />
            <span>
                In order to authenticate, you'll be redirected to the provider's website.
            </span>
        </aside>
    </div>
</template>

<script setup lang="ts">
import { PhQuestion } from '@phosphor-icons/vue';

</script>

<style scoped>
div {
    position: absolute;
    left: calc(var(--base-unit) * 4);
    border: 0.25rem solid var(--solid-purple);
    background-color: var(--off-white);
    padding: var(--base-unit);
    border-radius: var(--base-corner);
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    width: 30rem;
}

h2 {
    margin-bottom: calc(var(--base-unit) * 2);
}

p {
    margin-bottom: calc(var(--base-unit));
}

aside {
    display: flex;
    padding: 8px;
    justify-content: center;
    align-items: center;
    gap: 8px;
    border-radius: var(--base-corner);
    background-color: var(--solid-purple);
    color: var(--off-white);
}
</style>
