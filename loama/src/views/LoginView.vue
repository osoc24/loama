<template>
  <div class="signin-container">
    <div class="left-panel">
      <LoginForm @toggle-provider="toggleSidePanel" v-model:showPopup="showPopup" title="LOAMA"
        subtitle="SOLID permissions made easy" />
      <SidePanel :is-open="isPanelOpen" @toggle-provider="toggleSidePanel" ref="sidePanel" />
    </div>
    <div class="right-panel">
      <InfoPopup v-show="showPopup" />
      <img src="../assets/loama.svg" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import LoginForm from '@/components/LoginForm.vue';
import SidePanel from '@/components/SidePanel.vue';
import InfoPopup from '@/components/InfoPopup.vue';

const isPanelOpen = ref(false);
const showPopup = ref(false);

const toggleSidePanel = () => {
  isPanelOpen.value = !isPanelOpen.value;
} 
</script>


<style scoped>
img {
  height: 65vh;
}

.signin-container {
  display: flex;
  height: 100vh;
  width: 100vw;
}

.left-panel,
.right-panel {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}

.left-panel {
  flex-direction: column;
  gap: 4rem;
  flex: 2;
  background-color: var(--lama-gray);
  background: var(--Login-Fade, linear-gradient(180deg, #F7F7F7 95%, #BFA8FF 100%));
  padding: 0 4rem;
}

.right-panel {
  flex: 5;
  background-color: var(--solid-purple);
  position: relative;
}

.extra-panel {
  background-color: #f0f0f0;
  width: 30%;
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  z-index: 999;
  overflow-y: auto;
  padding: 20px;
  margin: 0;
}
</style>
