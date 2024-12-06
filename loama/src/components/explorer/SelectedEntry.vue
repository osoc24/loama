<template>
    <div class="container" v-if="podStore.selectedEntry">
        <header>
            <ExplorerEntity :is-container="podStore.selectedEntry.isContainer">
                {{ podStore.selectedEntry.name }}
            </ExplorerEntity>
            <PhXCircle :size="40" @click="$emit('close')" class="clickable" />
        </header>
        <section>
            <div class="list-header">
                <h3>Subjects with permissions:</h3>
                <LoButton :left-icon="PhPencil" @click="() => permissionDrawerVisible = true">Edit</LoButton>
            </div>
            <ul>
                <li :key="activeController.getLabelForSubject(permission.subject)"
                    v-for="permission in podStore.selectedEntry.permissionsPerSubject">
                    {{ activeController.getLabelForSubject(permission.subject) }}
                </li>
            </ul>
        </section>
        <Drawer v-model:visible="permissionDrawerVisible" header="Edit permissions" position="right"
            class="permission-drawer">
            <SubjectPermissionTable />
        </Drawer>
    </div>
    <p v-else>No entry selected in the resource explorer, this shouldn't be possible!</p>
</template>

<script setup lang="ts">
import { usePodStore } from '@/lib/state';
import ExplorerEntity from './ExplorerEntity.vue';
import { PhPencil, PhXCircle } from '@phosphor-icons/vue';
import { activeController } from 'loama-controller';
import LoButton from '../LoButton.vue';
import { ref } from 'vue';
import Drawer from 'primevue/drawer';
import SubjectPermissionTable from './SubjectPermissionTable.vue';

const podStore = usePodStore();

defineEmits<{ close: [] }>()

const permissionDrawerVisible = ref(false);
</script>

<style scoped>
form {
    margin-top: calc(var(--base-unit) * 2);
}

section {
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

a {
    text-decoration: none;
}

.clickable {
    cursor: pointer;
}

.container {
    background-color: var(--solid-purple);
}

.list-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}
</style>
<style src="@vueform/multiselect/themes/default.css"></style>
<style>
.permission-drawer {
    width: 90vw !important;
}
</style>
<style src="@vueform/multiselect/themes/default.css"></style>
