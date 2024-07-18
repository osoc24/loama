<template>
  <Suspense>
    <HeaderBase pfp-src="https://thispersondoesnotexist.com">
      <HeaderTab href="/home" active>Files</HeaderTab>
    </HeaderBase>
  </Suspense>
  <main>
    <hr />
    <Suspense>
      <PodList />

      <template #fallback>
        Loading pods...
      </template>
    </Suspense>
  </main>
</template>

<script setup lang="ts">
import HeaderTab from "../components/header/HeaderTab.vue";
import HeaderBase from '../components/header/HeaderBase.vue'
import PodList from '../components/PodList.vue'
</script>
