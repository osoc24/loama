<template>
    <fieldset>
        <input type="checkbox" :id="id" v-model="checked"
            @input="(event) => $emit('update:checked', event.target.checked)">
        <label :for="id">
            <slot></slot>
        </label>
    </fieldset>
</template>

<script setup lang="ts">
import { ref, watchEffect } from 'vue';

const props = defineProps<{ id: string; defaultValue: boolean }>();

const checked = ref(props.defaultValue);

watchEffect(() => checked.value = props.defaultValue);
</script>

<style scoped>
fieldset {
    border: none;
    display: flex;
    align-content: center;
    gap: .7rem;
}
</style>