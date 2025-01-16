<template>
    <div class="popup-container">
        <PhQuestion :size="24" @mouseover="showPopup = true;" @mouseleave="showPopup = false" />
        <div class="floating-popup" v-if="showPopup">
            <h3>{{ title }}</h3>
            <p>{{ message }}</p>
        </div>
    </div>
</template>
<script setup lang='ts'>
import { PhQuestion } from '@phosphor-icons/vue';
import { ref } from 'vue';

defineProps<{title: string; message: string}>()

let showPopup = ref(false)
</script>
<style scoped>
.popup-container {
    position: relative;
}

.floating-popup {
    position: absolute;
    z-index: 10;
    left: 30px;
    top: 0;
    border: 0.25rem solid var(--solid-purple);
    background-color: var(--off-white);
    padding: var(--base-unit);
    border-radius: var(--base-corner);
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    width: 30rem;
}

h3 {
    margin-bottom: calc(var(--base-unit) * 2);
    font-size: calc(var(--base-unit)*3);
}

p {
    margin-bottom: calc(var(--base-unit));
}

aside {
    display: flex;
    padding: 8px;
    justify-content: center;
    align-items: center;
    gap: 8px;
    border-radius: var(--base-corner);
    background-color: var(--solid-purple);
    color: var(--off-white);
}
</style>
