<template>
    <div v-if="selectedEntry">
        <DataTable :value="selectedEntry?.permissionsPerSubject ?? []">
            <template #header>
                <div class="table-header">
                    <span class="">Subjects with permissions</span>
                    <LoButton :left-icon="PhPlus">New subject</LoButton>
                </div>
            </template>
            <template #empty> No subjects with permissions set for this resource</template>
            <Column header="Name">
                <template #body="slotProps">
                    <p>{{ inruptController.getLabelForSubject(slotProps.data.subject) }}</p>
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
        <Drawer :visible="!!selectedSubject" @update:visible="() => selectedSubject = null" header="Edit subject"
            position="right" class="subject-drawer">
            <div v-if="selectedSubject">
                <p>Editing permissions for: {{ inruptController.getLabelForSubject(selectedSubject.subject) }}</p>
                <div>
                    <LoSwitch v-for="permission in ALL_PERMISSIONS" :key="permission" :id="permission"
                        :default-value="selectedSubject.permissions.includes(permission)"
                        @update:checked="checked => handleSubjectPermissionUpdates(checked, permission)">
                        {{ permission }}
                    </LoSwitch>
                    <LoSwitch :id="Permission.Control"
                        :default-value="selectedSubject.permissions.includes(Permission.Control)"
                        @update:checked="() => { }">
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
import { selectedEntry } from '@/lib/state';
import LoButton from '../LoButton.vue';
import LoCheck from '../LoCheck.vue';
import { PhPencil, PhPlus, PhWarning } from '@phosphor-icons/vue';
import { Permission, inruptController, type PublicSubject, type SubjectPermissions, type WebIdSubject } from 'loama-controller';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import { ref } from 'vue';
import Drawer from 'primevue/drawer';
import LoSwitch from '../LoSwitch.vue';

const ALL_PERMISSIONS: Permission[] = [Permission.Read, Permission.Write, Permission.Append];

const selectedSubject = ref<SubjectPermissions<WebIdSubject | PublicSubject> | null>(null);
const updating = ref(false);

const handleSubjectPermissionUpdates = async (newValue: boolean, permission: Permission) => {
    if (!selectedEntry.value) {
        throw new Error('No selected entry to update permissions for');
    }
    if (!selectedSubject.value) {
        throw new Error('No selected subject to update permissions for');
    }
    try {
        updating.value = true;
        if (newValue) {
            await inruptController.addPermission(selectedEntry.value.resourceUrl, permission, selectedSubject.value.subject);
        } else {
            await inruptController.removePermission(selectedEntry.value.resourceUrl, permission, selectedSubject.value.subject);
        }
    } catch (e) {
        console.error('Failed to update permissions', e);
    } finally {
        updating.value = false;
    }
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
