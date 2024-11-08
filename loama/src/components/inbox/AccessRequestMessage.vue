<template>
    <div class="container">
        <p><span class="prefix">From:</span> {{ message.actor }}</p>
        <p><span class="prefix">Target:</span> {{ message.target }}</p>
        <div>
            <span class="prefix">Requested: </span>
            <p v-for="label in aclLabels" :key="label">{{ label }}</p>
        </div>
        <div class="actions">
            <LoButton @click="rejectAccessRequest" variant="secondary">Reject</LoButton>
            <LoButton @click="acceptAccessRequest">Accept</LoButton>
        </div>
    </div>
</template>
<script setup lang="ts">
import { Permission, activeController, createBasicController, type AccessRequestMessage } from 'loama-controller';
import { computed } from 'vue';
import LoButton from '../LoButton.vue';
import { useToast } from 'primevue/usetoast';
import { getDefaultSession } from '@inrupt/solid-client-authn-browser';
import { listWebIdPodUrls } from 'loama-common';

const toast = useToast();
const props = defineProps<{
    message: AccessRequestMessage
}>()
const emit = defineEmits<{
    (e: 'reload'): void
}>();

const aclLabels = computed(() => props.message.permissions.map(getLabelForAclPermission));

const aclToInfo: Record<string, { label: string, value: Permission }> = {
    "acl:Read": {
        label: "Read",
        value: Permission.Read
    },
    "acl:Append": {
        label: "Append",
        value: Permission.Append
    },
    "acl:Write": {
        label: "Write",
        value: Permission.Write
    },
    "acl:Control": {
        label: "Control",
        value: Permission.Control,
    },
}

const getLabelForAclPermission = (permission: string) => {
    let label = aclToInfo[permission]?.label;
    if (!label) {
        console.error(`No info for ${permission}`);
        label = permission;
    }
    return label
}

const getActorController = async () => {
    const actorController = createBasicController();
    const session = getDefaultSession();
    let pods = await listWebIdPodUrls(props.message.actor, session.fetch);
    actorController.setPodUrl(pods[0])
    return actorController
}

const acceptAccessRequest = async () => {
    for (const acl of props.message.permissions) {
        const permission = aclToInfo[acl]?.value;
        if (!permission) {
            console.error(`No permission assigned to requested permission: ${acl}`)
            continue;
        }
        await activeController.addPermission(props.message.target, permission, {
            type: "webId",
            selector: {
                url: props.message.actor
            }
        });
    }

    const actorController = await getActorController();
    try {
        await activeController.AccessRequest().removeRequest(props.message.id)
        await actorController.AccessRequest().sendResponseNotification("accept", props.message.target);
        toast.add({
            severity: "success",
            summary: "Access request accepted",
            detail: `Request from ${props.message.actor} to ${props.message.target}`,
            life: 3000,
        })
        emit("reload")
    } catch (e) {
        toast.add({
            severity: "error",
            summary: "Failed to deny access request",
            detail: e instanceof Error ? e.message : `An unknown error happened: ${e}`,
            life: 3000,
        })
    }
}

const rejectAccessRequest = async () => {
    const actorController = await getActorController();
    try {
        await activeController.AccessRequest().removeRequest(props.message.id)
        await actorController.AccessRequest().sendResponseNotification("reject", props.message.target);
        toast.add({
            severity: "info",
            summary: "Access request denied",
            detail: `Request from ${props.message.actor} to ${props.message.target}`,
            life: 3000,
        })
        emit("reload")
    } catch (e) {
        toast.add({
            severity: "error",
            summary: "Failed to deny access request",
            detail: e instanceof Error ? e.message : `An unknown error happened: ${e}`,
            life: 3000,
        })
    }
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
    float: right;
}
</style>
