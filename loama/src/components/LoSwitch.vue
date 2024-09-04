<template>
    <fieldset>
        <input type="checkbox" :id="id" v-model="checked" @input="handleInput" :disabled="disabled">
        <label :for="id">
            <slot></slot>
        </label>
    </fieldset>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

const props = defineProps<{ id: string; defaultValue: boolean; disabled?: boolean; }>();
const emit = defineEmits<{
    (e: "update:checked", checked: boolean): void,
}>()

const checked = ref(props.defaultValue);

const handleInput = (e: Event) => {
    if (!e.target) return;
    const checked = (e.target as HTMLInputElement)?.checked ?? false;
    emit('update:checked', checked)
};

defineExpose({
    updateChecked: (newValue: boolean) => {
        checked.value = newValue
    },
})

watch(() => props.defaultValue, (newValue) => {
    checked.value = newValue;
});
</script>

<style scoped>
fieldset {
    border: none;
    display: flex;
    align-content: center;
    gap: .7rem;
}
</style>
