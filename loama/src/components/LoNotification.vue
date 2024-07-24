<template>
  <div v-show="visible" :class="['notification', type]">
    <span>{{ message }}</span>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

defineProps<{ type: 'success' | 'error', message: string }>();
const visible = ref(true);

const timeoutDuration = 2000;

onMounted(() => {
  setTimeout(() => {
    visible.value = false;
  }, timeoutDuration);
});
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
  background-color: var(--success-green);
  color: var(--success-green-text);
}

.notification.error {
  background-color: var(--error-red);
  color: var(--error-red-text);
}
</style>
