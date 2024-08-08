<template>
  <div class="signin-container">
    <div class="left-panel">
      <LoginForm @toggle-provider="toggleSidePanel" title="DoctorApp" />
      <SidePanel
        :is-open="isPanelOpen"
        @toggle-provider="toggleSidePanel"
        ref="sidePanel"
      />
    </div>
    <div class="right-panel">
      <Logo class="bg-img" />
      <div class="overlay"></div>
    </div>
  </div>
</template>

<script>
import LoginForm from '@/components/login/LoginForm.vue';
import Logo from '@/components/login/Logo.vue';
import SidePanel from '@/components/login/SidePanel.vue';

export default {
  name: 'login',
  components: {
    LoginForm,
    Logo,
    SidePanel
  },
  data() {
    return {
      isPanelOpen: false,
      selectedPod: null,
    };
  },
  methods: {
    toggleSidePanel() {
      this.isPanelOpen = !this.isPanelOpen;
    }
  }
};
</script>


<style scoped>
.signin-container {
  display: flex;
  height: 100vh;
  width: 100vw;
}

.left-panel, .right-panel {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}

.left-panel {
  flex: 1;
  background-color: #E7F9E8;
}

.right-panel {
  flex: 2;
  background-color: #29487D;
  position: relative; 
}

.overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5); 
  z-index: 1; 
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



