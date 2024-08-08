<template>
  <aside class="personal-information">
    <img :src="img" alt="profile picture" />
    <h1>{{ name }}</h1>
    <p>
        <b>Description:&emsp;</b>
        {{ description.slice(0, 150) }}...
    </p>
    <p>
        <b>Email:&emsp;</b>
        <a :href="'mailto:' + mbox">{{ mbox.replace('mailto:', '') }}</a>
    </p>
    <p>
        <b>Phone Number:&emsp;</b>
        <a :href="'tel:' + phone">{{ phone.replace('tel:', '') }}</a>
    </p>
  </aside>
</template>

<script setup lang="ts">
import { defineProps } from 'vue';

const props = defineProps<{
  name: string;
  description: string;
  mbox: string;
  img: string;
  phone: string;
}>();
</script>

<style scoped>
.personal-information {
  display: flex;
  flex-direction: column;
  gap: 3rem;
  justify-content: start;
  align-items: start;
  padding: 4rem;
}

img {
  border-radius: 50%;
  width: 5rem;
  height: 5rem;
}
</style>
