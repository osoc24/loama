<template>
    <div class="container">
        <p><span class="prefix">From:</span> {{ message.actor }}</p>
        <p><span class="prefix">Target:</span> {{ message.target }}</p>
        <div>
            <span class="prefix">Requested: </span>
            <p v-for="label in aclLabels" :key="label">{{ label }}</p>
        </div>
        <div class="actions">
            <LoButton variant="secondary">Reject</LoButton>
            <LoButton>Accept</LoButton>
        </div>
    </div>
</template>
<script setup lang="ts">
import { activeController, type AccessRequestMessage } from 'loama-controller';
import { computed } from 'vue';
import LoButton from '../LoButton.vue';

const props = defineProps<{
    message: AccessRequestMessage
}>()

const aclLabels = computed(() => props.message.permissions.map(getLabelForAclPermission));

const aclToLabel: Record<string, string> = {
    "acl:Read": "Read",
    "acl:Append": "Append",
    "acl:Write": "Write",
    "acl:Control": "Control",
}

const getLabelForAclPermission = (permission: string) => {
    let label = aclToLabel[permission];
    if (!label) {
        console.error(`No label for ${permission}`);
        label = permission;
    }
    return label
}

const acceptAccessRequest = async () => {
    await activeController.AccessRequest.removeRequest(props.message.id)
}

const rejectAccessRequest = async () => {
    await activeController.AccessRequest.removeRequest(props.message.id)
}
</script>
<style scoped lang="scss">
.container {
    padding: .5rem;
    border: 1px solid var(--solid-purple);
    border-radius: .5rem;
    text-align: left;

    &>div {
        display: flex;
        flex-direction: row;
        gap: .25rem;
    }
}

.prefix {
    font-weight: 700;
}

.actions {
    display: flex;
    gap: .5rem;
}
</style>
