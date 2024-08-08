<template>
  <HeaderBase :pfp-src="userProfile.img" :name="userProfile.name" title="MOCKBOOK"></HeaderBase>
  <main>
    <div v-if="postsError" class="error-message">
      <p>Unable to load profile information. Please check your access permissions or try again later.</p>
    </div>
    <Posts v-else :posts="postsData" :name="userProfile.name" />
  </main>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import HeaderBase from '@/components/home/header/HeaderBase.vue';
import Posts from '@/components/home/Posts.vue';
import { getPosts } from 'loama-app';
import { getProfileInfo } from 'loama-common';
import { store } from 'loama-app'
import type { Session } from '@inrupt/solid-client-authn-browser';

const session = store.session;
const userProfile = ref({
  name: 'Default Name',
  mbox: '',
  img: '',
  description: ''
});
const postsData = ref();
const postsError = ref(false);

const podUrl = store.usedPod.replace(/\/$/, '');

onMounted(async () => {
  const fetchedUserProfile = await getProfileInfo(session, podUrl);
  userProfile.value = fetchedUserProfile;

  try {
    const posts = await getPosts(session, podUrl);
    postsData.value = posts;
  } catch (error) {
    postsError.value = true;
  }
});
</script>

<style scoped>
main {
  padding: 4rem;
}

.error-message {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: red;
  flex-wrap: wrap;
}
</style>
