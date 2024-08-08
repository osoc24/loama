<template>
    <div class="container">
        <header>
            <ExplorerEntity :is-container="isContainer">
                {{ name }}
            </ExplorerEntity>
            <PhXCircle :size="40" @click="$emit('close')" class="clickable" />
        </header>
        <article>
            <label for="agents">
                <h3>User</h3>
            </label>
            <select name="agents" id="agents" v-model="selectedAgent">
                <option v-for="agent in Object.keys(agents)" :key="agent" :value="agent">{{ agent }}</option>
            </select>
            <form>
                <LoSwitch v-for="option in permissionOptions" :key="option.name" :id="option.name"
                    :default-value="isByDefaultSelected(option.name)"
                    @update:checked="updatePermissions(option.name, $event)">
                    {{ option.label }}
                </LoSwitch>
                <Notification v-if="updateStatus" :type="updateStatus.ok ? 'success' : 'error'"
                    :message="updateStatus.ok ? updateStatus.value : String(updateStatus.error) || 'No message available'" />
            </form>
        </article>
    </div>
</template>

<script setup lang="ts">
import ExplorerEntity from './ExplorerEntity.vue';
import { PhXCircle } from '@phosphor-icons/vue';
import { ref, watch } from 'vue';

import LoSwitch from '../LoSwitch.vue';
import { Permission, Type } from 'loama-controller/dist/types';
import { editPermissions, getOrCreateIndex, addPermissions, getItemId } from 'loama-controller';
import { store } from '@/store';
import type { Result } from '@/utils/types';
import Notification from '../LoNotification.vue';

const emits = defineEmits<{ updatePermissions: [selectedAgent: string, newPermissions: Permission[]], close: [] }>()
const props = defineProps<{ name: string; url: string; isContainer: boolean; agents: Record<string, Permission[]> }>();

const selectedAgent = ref(Object.keys(props.agents)[0]);

const updateStatus = ref<Result | null>(null);

watch(props, () => updateStatus.value = null);

watch(() => props.url, async () => {
    await refetchData();
});


const permissionOptions = [
    { name: 'Read', label: "Able to read data" },
    { name: 'Write', label: "Able to add new data" },
    { name: 'Append', label: 'Able to modify existing data' },
    { name: 'Control', label: 'Able to manage access & permissions' }
];

// @ts-ignore If you cast the permission to a Permissions the comparison no longer works.
const isByDefaultSelected = (permission: string) => props.agents[selectedAgent.value].includes(permission);

const refetchData = async () => {
    try {
        const indexFile = await getOrCreateIndex(store.session, store.usedPod);

        const itemId = getItemId(indexFile, props.url, selectedAgent.value);

        if (itemId) {
            const updatedPermissions = indexFile.items.find(item => item.id === itemId)?.permissions || [];
            emits('updatePermissions', selectedAgent.value, updatedPermissions);
        } else {
            console.warn('Item ID is not available for refetching permissions');
        }
    } catch (error) {
        console.error('Error refetching data:', error);
    }
};


const updatePermissions = async (type: string, newValue: boolean) => {
    const indexFile = await getOrCreateIndex(store.session, store.usedPod);

    let permissions = props.agents[selectedAgent.value];

    if (newValue) {
        permissions.push(type as Permission);
    } else {
        permissions = permissions.filter((p) => p !== type);
    }

    const itemId = getItemId(indexFile, props.url, selectedAgent.value);

    try {
        if (itemId) {
            await editPermissions(store.session, indexFile, itemId, permissions);
        } else {
            // NOTE: This should be more fleshed out, e.g. username support
            const userType = selectedAgent.value === "public" ? undefined : { type: Type.WebID, url: selectedAgent.value };
            await addPermissions(store.session, indexFile, [props.url], userType, permissions);
        }

        await refetchData();

        updateStatus.value = { ok: true, value: 'The permissions were successfully updated!' };
    } catch (e) {
        updateStatus.value = { ok: false, error: 'An error occurred while updating the permissions. Please try again.' };
    }
}
</script>

<style scoped>
form {
    margin-top: calc(var(--base-unit) * 2);
}

article {
    background-color: var(--off-white);
    border-radius: var(--base-corner);
    height: 100%;
    padding: 2rem;
}

header {
    display: flex;
    color: var(--off-white);
    flex-grow: 1;
    padding: 2rem;
}

h3 {
    font-size: calc(var(--base-unit) * 2);
}

.clickable {
    cursor: pointer;
}

.container {
    background-color: var(--solid-purple);
}
</style>
