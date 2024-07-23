<template>
    <div v-if="visible" :class="['notification', type]">
      <span>{{ message }}</span>
      <button @click="closeNotification">X</button>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref } from 'vue';
  
  const props = defineProps<{ type: 'success' | 'error', message: string }>();
  const visible = ref(true);
  
  const closeNotification = () => {
    visible.value = false;
  };
  </script>
  
  <style scoped>
  .notification {
    padding: 1rem;
    border-radius: 4px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 1rem 0;
  }
  
  .notification.success {
    background-color: #d4edda;
    color: #155724;
  }
  
  .notification.error {
    background-color: #f8d7da;
    color: #721c24;
  }
  
  button {
    background: none;
    border: none;
    color: inherit;
    font-size: 1rem;
    cursor: pointer;
  }
  </style>
  