<template>
    <div>
        <Drawer v-model:visible="visible" header="New Subject" position="right" class="new-subject-drawer">
            <p>This will add the subject to the permission table & give it read rights.</p>
            <Select v-model="selectedType" :options="typeOptions" placeholder="Select a subject type"
                class="w-full md:w-56" />
            <div v-if="selectedType !== null" class="new-subject-content">
                <component ref="form" :is="subjectForms[selectedType]" />
                <div>
                    <LoButton :right-icon="PhPlus" @click="handleSubjectCreation">Create</LoButton>
                </div>
            </div>
        </Drawer>
        <LoButton :left-icon="PhPlus" @click="() => visible = true">New subject</LoButton>
    </div>
</template>
<script setup lang="ts">
import { PhPlus } from '@phosphor-icons/vue';
import { ref } from 'vue';
import LoButton from '../LoButton.vue';
import Drawer from 'primevue/drawer';
import Select from 'primevue/select';
import { computed } from 'vue';
import { subjectForms, type SubjectFormComponent } from '@/lib/subjectForms';

const visible = ref(false);
const selectedType = ref<keyof typeof subjectForms | null>(null);
const typeOptions = computed(() => Object.keys(subjectForms));
const form = ref<SubjectFormComponent | null>(null);

const handleSubjectCreation = async () => {
    if (form.value === null) {
        return;
    }
    const result = await form.value.create();
    if (!result) {
        return;
    }
    visible.value = false;
}
</script>

<style lang="scss">
.new-subject {
    &-drawer {
        width: 50vw !important;
    }

    &-content {
        padding-top: .5rem;
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }
}
</style>
