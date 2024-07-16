<template>
  <Suspense>
    <Header pfp-src="https://thispersondoesnotexist.com">
      <HeaderTab href="/home" active>Files</HeaderTab>
    </Header>
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
import HeaderTab from "../components/HeaderTab.vue";
import Header from '../components/Header.vue'
import PodList from '../components/PodList.vue'
</script>
