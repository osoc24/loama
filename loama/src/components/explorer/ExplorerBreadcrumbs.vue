<template>
    <div>
        <template v-for="(param, index) in params" :key="index">
            <RouterLink v-if="param !== '/' && index !== params.length - 2" :to="'../'.repeat(index)">
                {{ param }}
            </RouterLink>
            <div v-else>
                {{ param }}
            </div>
        </template>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const params = computed(() => route.path.split(/(\/)/).filter(p => p !== ""))
</script>

<style scoped>
div {
    display: unset;
}
</style>