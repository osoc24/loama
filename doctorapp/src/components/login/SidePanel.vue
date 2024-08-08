<template>
  <div class="extra-panel" v-if="isOpen">
    <div>
      <h2>No Pod yet?</h2>
      <p>No worries, you can create a pod with a pod provider or even host one yourself! We’ll give you some recommendations of hosts you can use:</p>
      <button v-for="pod in podList" :key="pod.name" @click="openPodUrl(pod)" :aria-label="'Open ' + pod.name">
        {{ pod.name }}
      </button>
    </div>
    <button id="close-btn" @click="closePanel()">Close Panel</button>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { podList } from 'loama-app';

export default defineComponent({
  props: {
    isOpen: {
      type: Boolean,
      required: true
    }
  },
  data() {
    return {
      podList: (podList as Array<{ name: string; url: string }>)
    };
  },
  methods: {
    openPodUrl(pod: { name: string; url: string }) {
      if (pod && pod.url) {
        window.open(pod.url, '_blank');
      }
      this.$emit('toggle-provider');
    },
    closePanel() {
      this.$emit('toggle-provider');
    }
  }
});
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
