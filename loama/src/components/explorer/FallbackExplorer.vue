<template>
    <div>
        <span></span>
        <p>
            <slot></slot>
        </p>
    </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
div {
    display: flex;
    flex-flow: column nowrap;
    align-items: center;
    justify-content: center;
    height: 100%;
    width: 100%;
    background-color: var(--off-white);
    height: calc(100vh - calc(var(--base-unit)* 14));
}

span {
    display: block;
    width: 60px;
    aspect-ratio: 1;
    --gradient: conic-gradient(from -90deg at 10px 10px, var(--solid-purple) 90deg, #0000 0);
    background: var(--gradient), var(--gradient), var(--gradient);
    background-size: 50% 50%;
    animation: l16 1s infinite;
}

@keyframes l16 {
    0% {
        background-position: 0 0, 10px 10px, 20px 20px
    }

    50% {
        background-position: 0 20px, 10px 10px, 20px 0
    }

    100% {
        background-position: 20px 20px, 10px 10px, 0 0
    }
}
</style>