<template>
    <div class="appointments">
      <h1>Appointments</h1>
      <Appointment 
            v-for="appointment in appointments"
            :key="appointment.time"
            :time="appointment.time"
            :date="appointment.date"
            :type="appointment.type"
            :location="appointment.location"
            :provider="appointment.provider"
      >      </Appointment>
    </div>
  </template>
  
  <script setup lang="ts">
 import Appointment from "./Appointment.vue";
  const props = defineProps<{
    appointments: {
        type: string,
        location: string,
        provider: string,
        time: string,
        date: string
    }[]
  }>();
  </script>
  
  <style scoped>
  .appointments {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 4rem;
    /* overflow-y: scroll; */
  }
  </style>
  