<template>
    <label :for="props.name">
        <span v-if="props.label">{{ props.label }}</span>
        <input v-model="model" :name="props.name" v-bind="$attrs" />
    </label>
</template>

<script setup lang="ts">
const model = defineModel();

const props = defineProps<{ label?: string; name?: string }>();
</script>

<style lang="scss" scoped>
label {
    display: flex;
    flex-direction: column;
    font-weight: 700;
}

input {
    padding: .5rem calc(var(--base-unit));
    border-color: var(--off-black);
    border-radius: var(--base-corner);

    &:focus {
        border-color: var(--solid-purple);
        outline: none;
    }
}
</style>
