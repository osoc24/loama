<template>
    <div class="posts">
      <h1>Posts</h1>
      <Post v-for="post in posts" :key="post.text" :name="name" :src="post.image" :text="post.text">
      </Post>
    </div>
  </template>
  
  <script setup lang="ts">
 import Post from "./Post.vue";  
  const props = defineProps<{
    posts: { name: string, image: string, text: string, video: string }[],
    name: string
  }>();
  </script>
  
  <style scoped>
  .posts {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  </style>
  