<template>
  <div class="extra-panel" v-if="isOpen">
    <div>
      <h2>No Pod yet?</h2>
      <p>No worries, you can create a pod with a pod provider or even host one yourself! We'll give you some
        recommendations of hosts you can use:</p>
      <button v-for="pod in podListData" :key="pod.name" @click="openPodUrl(pod)" :aria-label="'Open ' + pod.name">
        {{ pod.name }}
      </button>
    </div>
    <button id="close-btn" @click="emit('toggleProvider')">Close Panel</button>
  </div>
</template>

<script setup lang="ts">
import podList from '@/utils/podlist.json';

defineProps<{
  isOpen: Boolean
}>()

const emit = defineEmits<{
  toggleProvider: []
}>()

const podListData = (podList as { podList: Array<{ name: string; url: string }> }).podList;

const openPodUrl = (pod: { name: string; url: string }) => {
  if (pod && pod.url) {
    window.open(pod.url, '_blank');
  }
  emit("toggleProvider");
};
</script>


<style scoped>
.extra-panel {
  width: 100%;
  margin-top: 10px;
}

.extra-panel h2 {
  font-size: 30px;
  margin-bottom: 20px;
}

.extra-panel p {
  margin-bottom: 30px;
}

.extra-panel>div {
  margin-bottom: 20px;
}

.extra-panel button {
  display: block;
  margin-bottom: 10px;
  padding: 10px;
  width: 100%;
  background-color: #1d172f;
  color: white;
  border: none;
  cursor: pointer;
  border-radius: 5px;
}

.extra-panel button:hover {
  background-color: #29487d;
}

#close-btn {
  background-color: #ff4c4c;
  color: white;
}
</style>