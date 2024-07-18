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
import { getPosts, getAppointments, getProfileInfo } from "loama-controller";
import { onMounted } from "vue";
import type { Session } from "@inrupt/solid-client-authn-browser";
import { store } from "@/store";

const podUrl = 'https://css12.onto-deside.ilabt.imec.be/osoc1';

const session = store.session;

onMounted(async () => {
  try {
    const fetchedUserProfile = await getProfileInfo(session as Session, podUrl);
    console.log("fetchedUserProfile", fetchedUserProfile);

    const appointments = await getAppointments(session as Session, podUrl);
    console.log("fetchappointments", appointments);

    const posts = await getPosts(session as Session, podUrl);
    console.log("fetchposts", posts);
  } catch (error) {
    console.error("Error fetching data:", error);
  }
});
</script>
