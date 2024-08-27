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
            <MultiSelect name="agents" ref="agentSelect" v-model="selectedAgent" :options="agentOptions"
                :can-clear="false" :can-deselect="false" searchable create-option class="multiselect-purple" />
            <form>
                <LoSwitch v-for="option in permissionOptions" :key="option.name" :id="option.name"
                    :default-value="isByDefaultSelected(option.name)"
                    @update:checked="updatePermission(option.name, $event)">
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
import MultiSelect from '@vueform/multiselect'

import LoSwitch from '../LoSwitch.vue';
import { Permission } from 'loama-controller/dist/types';
import { addPermission, removePermission } from 'loama-controller';
import { store } from 'loama-app'
import type { Result } from '@/utils/types';
import Notification from '../LoNotification.vue';

const emits = defineEmits<{ updatePermissions: [selectedAgent: string, newPermissions: Permission[]], close: [] }>()
const props = defineProps<{ name: string; url: string; isContainer: boolean; agents: Record<string, Permission[]> }>();

const agentSelect = ref<MultiSelect | null>(null);

const selectedAgent = ref(Object.keys(props.agents)[0]);

const updateStatus = ref<Result | null>(null);

const agentOptions = ref(Object.keys(props.agents));

watch(props, (_, oldProp) => {
    updateStatus.value = null
    agentOptions.value = Object.keys(props.agents);
    if (oldProp.url !== props.url) {
        selectedAgent.value = agentOptions.value[0];
    }
});

const permissionOptions: { name: Permission, label: string }[] = [
    { name: Permission.Read, label: "Able to read data" },
    { name: Permission.Write, label: "Able to add new data" },
    { name: Permission.Append, label: 'Able to modify existing data' },
    { name: Permission.Control, label: 'Able to manage access & permissions' }
];

const isByDefaultSelected = (permission: Permission) => {
    if (!props.agents[selectedAgent.value]) return false;
    return props.agents[selectedAgent.value].includes(permission)
};

const updatePermission = async (permissionString: string, newValue: boolean) => {
    const updatedPermission = permissionString as Permission;
    let success = true;
    try {
        let updatedPermissions = [];
        if (newValue) {
            updatedPermissions = await addPermission(store.session, props.url, selectedAgent.value, updatedPermission);
        } else {
            updatedPermissions = await removePermission(store.session, props.url, selectedAgent.value, updatedPermission)
        }
        emits('updatePermissions', selectedAgent.value, updatedPermissions);
    } catch (e) {
        success = false;
    }

    if (success) {
        updateStatus.value = { ok: true, value: 'The permissions were successfully updated!' };
    } else {
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

.multiselect-purple {
    --ms-ring-color: #9F7EFF30;
    --ms-spinner-color: #9F7EFF;
    --ms-option-bg-selected: #7C4DFF;
    --ms-option-bg-selected-pointed: #9F7EFF;
    --ms-option-color-selected-disabled: #6334E6;
}
</style>
<style src="@vueform/multiselect/themes/default.css"></style>
