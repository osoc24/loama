<template>
    <button :class="classList">
        <component :v-if="leftIcon" :is="leftIcon" :size="24" />
        <span>
            <slot></slot>
        </span>
        <component :v-if="rightIcon" :is="rightIcon" :size="24" />
    </button>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(defineProps<{
    /**
     * The icon to display on the left side of the button. Should be a Phosphor icon from the `@phosphor-icons/vue` package.
     */
    leftIcon?: Object,
    /**
     * The icon to display on the right side of the button. Should be a Phosphor icon from the `@phosphor-icons/vue` package.
     */
    rightIcon?: Object,
    /**
     * The variant of the button; defaults to primary.
     */
    variant?: "primary" | "secondary"
}>(), {
    variant: "primary"
})

const classList = computed(() => {
    return {
        primary: props.variant === "primary",
        secondary: props.variant === "secondary"
    }
})
</script>

<style scoped>
button {
    display: flex;
    flex-flow: row nowrap;
    align-items: center;
    font-size: 1rem;
    font-style: normal;
    font-weight: 700;
    line-height: normal;
    padding: var(--base-unit);
    gap: var(--base-unit);
    border-radius: var(--base-corner);
    height: fit-content;
    border: none;
    cursor: pointer;
    border: .2em solid;
}

button[disabled] {
    background-color: grey;
    cursor: not-allowed;
}

button:hover:not([disabled]) {
    background-color: var(--off-black);
    border-color: var(--off-black);
    color: var(--off-white);
}

.primary {
    background-color: var(--solid-purple);
    border-color: var(--solid-purple);
    color: var(--off-white);
}

.secondary {
    background-color: var(--solid-white);
    color: var(--off-black);
    border-color: var(--solid-purple);
}
</style>