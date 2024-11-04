<template>
    <h3>Incoming Access Requests</h3>
    <div class="request-list">
        <AccessRequestMessage v-for="message in messages" :key="message.id" :message="message" />
    </div>
</template>
<script setup lang="ts">
import { activeController } from 'loama-controller';
import AccessRequestMessage from './AccessRequestMessage.vue';

const messages = await activeController.AccessRequest().loadAccessRequests();
</script>
<style scoped>
.request-list {
    display: flex;
    flex-direction: column;
    gap: .5rem;
}
</style>
