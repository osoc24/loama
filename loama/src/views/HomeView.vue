<template>
    <main>
        <Suspense>
            <ResourceExplorer />
            <template #fallback>
                <FallbackExplorer>Loading resource explorer...</FallbackExplorer>
            </template>
        </Suspense>
    </main>
</template>

<script setup lang="ts">
import ResourceExplorer from '../components/explorer/ResourceExplorer.vue'
import FallbackExplorer from '../components/explorer/FallbackExplorer.vue'
</script>
