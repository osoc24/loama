<template>
    <div class="appointment">
      <div class="appointment-header">
        <span class="appointment-author">Appointment</span>
      </div>
      <div class="appointment-content">
        <div>
          <p><b>Time:</b> {{ time }}</p>
          <p><b>Date:</b> {{ date }}</p>
        </div>
        <div>
          <p><b>Type:</b> {{ type }}</p>
          <p><b>Location:</b> {{ location }}</p>
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  const props = defineProps<{
    time: string;
    date: string;
    type: string;
    location: string;
    provider: string;
  }>();
  </script>
  
  <style scoped>
  .appointment {
    background-color: #E7F9E8;
    border-radius: 0.5rem;
    padding: 3rem;
    margin-bottom: 1rem;
    width: 100%;
  }
  
  .appointment-header {
    font-weight: bold;
    margin-bottom: 1rem;
  }
  
  .appointment-content, .appointment-content p {
    margin-bottom: 0.5rem;
  }

  .appointment-content {
    display: flex;
    flex-direction: row;
    gap: 4rem;
  }
  </style>
  