<template>
    <img :src="src" alt="Profile Picture" class="profile-picture" @click="onClick"/>
  </template>
  
  <script setup lang="ts">
  const props = defineProps<{
    src: string
  }>();
  
  const emit = defineEmits(['click']);
  
  function onClick() {
    emit('click');
  }
  </script>
  
  <style scoped>
  .profile-picture {
    border-radius: 50%;
    width: 3rem;
    height: 3rem;
    cursor: pointer;
  }
  </style>
  