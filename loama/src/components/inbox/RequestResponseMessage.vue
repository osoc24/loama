<template>
    <div class="container">
        <div><p class="prefix">Accepted:</p><PhCheckCircle v-if="message.isAccepted" weight="bold" /><PhXCircle v-else weight="bold" /></div>
        <p><span class="prefix">To:</span> {{ message.target }}</p>
        <div>
            <span class="prefix">Requested Permissions: </span>
            <p v-for="label in aclLabels" :key="label">{{ label }}</p>
        </div>
        <div class="actions">
            <LoButton @click="confirmMessage">Confirm</LoButton>
        </div>
    </div>
</template>
<script setup lang="ts">
import { PhCheckCircle, PhXCircle } from '@phosphor-icons/vue';
import { activeController, type RequestResponseMessage } from 'loama-controller';
import { computed } from 'vue';
import LoButton from '../LoButton.vue';

const props = defineProps<{
    message: RequestResponseMessage,
}>();
const emit = defineEmits<{
    (e: "reload"): void,
}>();

const aclLabels = computed(() => props.message.permissions.map(p => aclToLabel[p] ?? p));
const aclToLabel: Record<string, string> = {
    "acl:Read": "Read",
    "acl:Append": "Append",
    "acl:Write": "Write",
    "acl:Control": "Control",
}

const confirmMessage = async () => {
    await activeController.AccessRequest().removeRequest(props.message.id);
    emit("reload")
}

</script>
<style lang="scss" scoped>
.container {
    padding: .5rem;
    border: 1px solid var(--solid-purple);
    border-radius: .5rem;
    text-align: left;

    &>div {
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: .25rem;
    }

    &>p {
        display: inline;
    }
}

.actions {
    float: right;
}
</style>
