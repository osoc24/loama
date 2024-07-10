<template>
  <main>
    <button @click="logout">Logout</button>

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
import PodList from '../components/PodList.vue'
import router from "@/router";
import { store } from "@/store";

const session = store.session;

const logout = async () => { session.logout(); router.push('/'); }

</script>
