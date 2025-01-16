<template>
    <div class="header">
        <h3>Request Responses</h3>
        <PhArrowClockwise weight="bold" :size="32" @click="reloadMessages" />
    </div>
    <div class="request-list">
        <RequestResponseMessage v-for="message in messages" :key="message.id" :message="message"
            @reload="reloadMessages" />
    </div>
</template>
<script setup lang="ts">
import { activeController } from 'loama-controller';
import { PhArrowClockwise } from '@phosphor-icons/vue';
import RequestResponseMessage from './RequestResponseMessage.vue';
import { ref } from 'vue';

let messages = ref(await activeController.AccessRequest().loadRequestResponses());

const reloadMessages = async () => {
    messages.value = await activeController.AccessRequest().loadRequestResponses();
}
</script>
<style scoped lang="scss">
.request-list {
    display: flex;
    flex-direction: column;
    gap: .5rem;
}

.header {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 0.5rem;

    &>svg {
        justify-self: end;
        cursor: pointer;
    }
}
</style>
