<template>
    <div v-if="podStore.selectedEntry">
        <DataTable :value="podStore.selectedEntry?.permissionsPerSubject ?? []">
            <template #header>
                <div class="table-header">
                    <span class="">Subjects with permissions</span>
                    <NewSubject />
                </div>
            </template>
            <template #empty> No subjects with permissions set for this resource</template>
            <Column header="Name">
                <template #body="slotProps">
                    <p>{{ activeController.getLabelForSubject(slotProps.data.subject) }}</p>
                </template>
            </Column>
            <Column header="Type">
                <template #body="slotProps">
                    <p>{{ slotProps.data.subject.type }}</p>
                </template>
            </Column>
            <Column v-for="permission in ALL_PERMISSIONS" :key="permission" :header="permission">
                <template #body="slotProps">
                    <LoCheck v-if="slotProps.data.permissions?.includes(permission)" />
                </template>
            </Column>
            <Column>
                <template #header>
                    <div v-tooltip.top="'This gives complete control over the resource, give with care!'"
                        class="control-header">
                        <span>
                            Control
                        </span>
                        <PhWarning color="#ffa348" weight="fill" size="1.5rem" />
                    </div>
                </template>
                <template #body="slotProps">
                    <LoCheck v-if="slotProps.data.permissions?.includes(Permission.Control)" />
                </template>
            </Column>
            <Column header="">
                <template #body="slotProps">
                    <LoButton :left-icon="PhPencil" @click="() => selectedSubject = slotProps.data">Edit</LoButton>
                </template>
            </Column>
        </DataTable>
        <Drawer :visible="!!selectedSubject" @update:visible="handleSubjectDrawerClose" header="Edit subject"
            position="right" class="subject-drawer">
            <div v-if="selectedSubject">
                <p>Editing permissions for: {{ activeController.getLabelForSubject(selectedSubject.subject) }}</p>
                <div>
                    <LoSwitch :id="Permission.Read"
                        :default-value="selectedSubject.permissions.includes(Permission.Read)" :disabled="updating"
                        @update:checked="checked => handleSubjectPermissionUpdates(checked, Permission.Read)">
                        {{ Permission.Read }}
                    </LoSwitch>
                    <LoSwitch :id="Permission.Write"
                        :default-value="selectedSubject.permissions.includes(Permission.Write)" :disabled="updating"
                        @update:checked="checked => handleSubjectPermissionUpdates(checked, Permission.Write)">
                        {{ Permission.Write }}
                    </LoSwitch>
                    <LoSwitch :id="Permission.Append"
                        :default-value="selectedSubject.permissions.includes(Permission.Append)"
                        :disabled="selectedSubject.permissions.includes(Permission.Write) || updating"
                        @update:checked="checked => handleSubjectPermissionUpdates(checked, Permission.Append)">
                        {{ Permission.Append }}
                    </LoSwitch>
                    <LoSwitch ref="controlCheckbox" :id="Permission.Control"
                        :default-value="selectedSubject.permissions.includes(Permission.Control)" :disabled="updating"
                        @update:checked="checked => handleControlPermissionChange(checked)">
                        {{ Permission.Control }}
                    </LoSwitch>
                </div>
            </div>
            <p v-else>You shouldn't be able to see this drawer...</p>
        </Drawer>
    </div>
    <div v-else>
        <p>No entry selected by viewing the table, this shouldn't be possible!</p>
    </div>
</template>
<script setup lang="ts">
import { usePodStore } from '@/lib/state';
import LoButton from '../LoButton.vue';
import LoCheck from '../LoCheck.vue';
import { PhPencil, PhWarning } from '@phosphor-icons/vue';
import { Permission, activeController, type PublicSubject, type SubjectPermissions, type WebIdSubject } from 'loama-controller';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import { ref } from 'vue';
import Drawer from 'primevue/drawer';
import LoSwitch from '../LoSwitch.vue';
import NewSubject from './NewSubject.vue';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from "primevue/useconfirm";

const ALL_PERMISSIONS: Permission[] = [Permission.Read, Permission.Write, Permission.Append];

const selectedSubject = ref<SubjectPermissions<WebIdSubject | PublicSubject> | null>(null);
const updating = ref(false);
const controlCheckbox = ref<typeof LoSwitch | null>(null)

const toast = useToast();
const podStore = usePodStore();
const confirm = useConfirm();

const handleControlPermissionChange = async (newValue: boolean) => {
    if (!podStore.selectedEntry) {
        throw new Error('No selected entry to update permissions for');
    }
    if (!controlCheckbox.value) {
        throw new Error('No control checkbox ref found');
    }
    if (!newValue) {
        handleSubjectPermissionUpdates(false, Permission.Control);
        return
    }
    confirm.require({
        header: "Grant control permission?",
        message: "This will give the selected subject complete control/admin rights over the resource, give with care!",
        rejectProps: {
            label: 'Cancel',
            severity: 'secondary',
            outlined: true
        },
        acceptProps: {
            label: 'Grant'
        },
        accept: () => {
            handleSubjectPermissionUpdates(true, Permission.Control);
        },
        reject: () => {
            controlCheckbox.value?.updateChecked(false);
        }
    })
}

const handleSubjectPermissionUpdates = async (newValue: boolean, permission: Permission) => {
    if (!podStore.selectedEntry) {
        throw new Error('No selected entry to update permissions for');
    }
    if (!selectedSubject.value) {
        throw new Error('No selected subject to update permissions for');
    }
    try {
        updating.value = true;
        if (newValue) {
            await activeController.addPermission(podStore.selectedEntry.resourceUrl, permission, selectedSubject.value.subject);
        } else {
            await activeController.removePermission(podStore.selectedEntry.resourceUrl, permission, selectedSubject.value.subject);
        }
    } catch (e) {
        console.error('Failed to update permissions', e);
        toast.add({ severity: "error", summary: `Failed to ${newValue ? "grant" : "revoke"} ${permission} permission`, detail: (e instanceof Error) ? e.message : "Unknown error occurred, check the console" })
    } finally {
        updating.value = false;
    }
}

const handleSubjectDrawerClose = async () => {
    if (updating.value === true) {
        toast.add({
            severity: "info",
            summary: "Please wait",
            detail: "The permissions are currently being updated, please wait for the operation to finish",
            life: 2000
        })
        return;
    }
    selectedSubject.value = null
    await podStore.refreshEntryPermissions();
}

</script>
<style scoped lang="scss">
.table-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    &>span {
        font-size: 1.25rem;
        font-weight: 700;
    }
}

.control-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: .25rem;
    font-weight: 700;
}
</style>
<style>
.subject-drawer {
    width: 30vw !important;
}
</style>
