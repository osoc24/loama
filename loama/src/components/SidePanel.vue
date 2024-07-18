<template>
  <div class="extra-panel" v-if="isOpen">
    <div>
      <h2>No Pod yet?</h2>
      <p>No worries, you can create a pod with a pod provider or even <u>host one</u> yourself! We'll give you some
        recommendations of hosts you can use:</p>
      <LoButton v-for="pod in podListData" :key="pod.name" @click="openPodUrl(pod)" :aria-label="'Open ' + pod.name">
        {{ pod.name }}
      </LoButton>
    </div>
    <LoButton :left-icon="PhX" class="secondary" @click="emit('toggleProvider')">Close Panel</LoButton>
  </div>
</template>

<script setup lang="ts">
import podList from '@/utils/podlist.json';
import LoButton from './LoButton.vue';
import { PhX } from '@phosphor-icons/vue';

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
  border-right: .2em solid var(--solid-purple);
}

h2 {
  font-size: 30px;
  margin-bottom: 20px;
}

p {
  margin-bottom: 30px;
}

div {
  margin-bottom: 20px;
}

button {
  margin-bottom: 10px;
  padding: 10px;
  width: 100%;
}
</style>