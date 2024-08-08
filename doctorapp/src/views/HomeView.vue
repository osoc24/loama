<template>
  <div class="dashboard">
    <HeaderBase :pfp-src="userProfile.img" :name="userProfile.name" title="DOCTORAPP"></HeaderBase>    
    <main>
      <div v-if="appointmentsError" class="error-message">
        <p>Unable to load appointments. Please check your access permissions or try again later.</p>
      </div>
      <div v-else class="appointments-container">
        <Appointments v-if="appointmentsData" :appointments="appointmentsData" class="appointments"/>
      </div>
      <div v-if="profileError" class="error-message">
        <p>Unable to load profile information. Please check your access permissions or try again later.</p>
      </div>
      <Sidebar 
        v-else
        :name="userProfile.name"
        :description="userProfile.description"
        :mbox="userProfile.mbox"
        :img="userProfile.img"
        :phone="userProfile.phone" class="personal-information"
      />
    </main>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import HeaderBase from '@/components/home/header/HeaderBase.vue';
import Appointments from '@/components/home/Appointments.vue';
import Sidebar from '@/components/home/Sidebar.vue';
import type { Session } from '@inrupt/solid-client-authn-browser';
import { getProfileInfo } from 'loama-common';
import { store, getAppointments } from 'loama-app'

const session = store.session;
const userProfile = ref({
  name: 'Default Name',
  mbox: '',
  img: '',
  description: '',
  phone: ''
});
const appointmentsData = ref();
const appointmentsError = ref(false);
const profileError = ref(false);

const podUrl = store.usedPod.replace(/\/$/, '');

onMounted(async () => {
    try {
      const fetchedUserProfile = await getProfileInfo(session, podUrl);
      userProfile.value = fetchedUserProfile;
    } catch (error) {
      profileError.value = true;
    }

    try {
      const appointments = await getAppointments(session, podUrl);
      appointmentsData.value = appointments;
    } catch (error) {
      appointmentsError.value = true;
    }
  });
</script>

<style scoped>
.dashboard {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

main {
  display: flex;
  height: 100%;
  overflow: hidden; 
}

.appointments-container {
  width: 66.67%;
  height: 100%; 
  overflow-y: auto; 
  margin-bottom: 1rem;
}

.error-message, .loading-message {
  width: 66.67%;
  height: 100%; 
  display: flex;
  align-items: center;
  justify-content: center;
  color: red;
  flex-wrap: wrap;
}

.personal-information {
  width: 33.33%;
  height: 100%; 
  justify-content: start;
  align-items: start;
  background-color: #ffffff; 
}
</style>
