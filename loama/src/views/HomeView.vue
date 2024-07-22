<template>
  <Suspense>
    <HeaderBase pfp-src="https://thispersondoesnotexist.com">
      <HeaderTab href="/home" active>Files</HeaderTab>
    </HeaderBase>
  </Suspense>
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
import HeaderTab from "../components/header/HeaderTab.vue";
import HeaderBase from '../components/header/HeaderBase.vue'
import ResourceExplorer from '../components/explorer/ResourceExplorer.vue'
import FallbackExplorer from '../components/explorer/FallbackExplorer.vue'
</script>
