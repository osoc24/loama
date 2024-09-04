<template>
    <div class="locheck">
        <PhCheckFat weight="fill" />
    </div>
</template>
<script setup lang="ts">
import { PhCheckFat } from '@phosphor-icons/vue';
</script>
<style scoped>
.locheck {
    background-color: var(--solid-purple);
    color: var(--off-white);
    border-radius: 50%;
    padding: .5rem;
    width: 2rem;
    height: 2rem;
    margin: 0 auto;
}
</style>
