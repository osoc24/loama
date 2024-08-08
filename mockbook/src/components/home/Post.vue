<template>
    <div class="post">
      <div class="post-header">
        <span class="post-author">{{ name }}</span>
      </div>
      <div class="post-content">
        <p>{{ text }}</p>
        <!-- check if src is valid link -->
        <img v-if="src" :src="src" alt="Post image" />
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  const props = defineProps<{
    name: string,
    text: string,
    src: string
  }>();
  </script>
  
  <style scoped>
  .post {
    background-color: #f0f4f8;
    border-radius: 0.5rem;
    padding: 3rem;
    margin-bottom: 1rem;
  }
  
  .post-header {
    font-weight: bold;
    margin-bottom: 0.5rem;
  }
  
  .post-content, .post-content p {
    margin-bottom: 0.5rem;
  }

  .post-footer {
    font-size: 0.875rem;
    color: #555;
  }
  </style>
  