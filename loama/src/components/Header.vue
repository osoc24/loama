<template>
    <header>
        <div class="wordmark">
            <Loama />
            <h1>Loama</h1>
        </div>
        <nav>
            <slot></slot>
        </nav>
        <img :src="pfpSrc" alt="User profile picture" @click="showContextMenu"/>
    </header>
    <aside :class="{visible: isContextMenuOpen}">
        <div>
            <strong>Name of Pod</strong>
            <p>https://css12.onto-deside.ilabt.imec.be/osoc1/</p>
        </div>
        <label for="pod">Selected Pod</label>
        <select>
            <option selected>https://css12.onto-deside.ilabt.imec.be/osoc1/</option>
            <option>https://css12.onto-deside.ilabt.imec.be/osoc1/</option>
        </select>
        <button @click.prevent="logout">Sign out</button>
    </aside>
</template>

<style scoped>
    header, .wordmark, nav {
        display: flex;
        flex-flow: row nowrap;
    }

    .wordmark, img {
        margin-bottom: calc(var(--base-unit));
    }

    header, img {
        border: 0.25rem solid var(--solid-purple);
    }

    header {
        width: 100%;
        gap: calc(var(--base-unit)*5);
        border-radius: 0 0 var(--base-corner) var(--base-corner);
        border-bottom: 0.5rem solid var(--solid-purple);
        border-top: 0;
        padding: calc(var(--base-unit)*3) calc(var(--base-unit)*6) 0 calc(var(--base-unit)*3);
    }

    h1 {
        font-family: "JetBrains Mono";
        font-size: calc(var(--base-unit)*6);
        font-style: normal;
        font-weight: 700;
        line-height: normal;
        color: var(--solid-purple);
        text-transform: uppercase;
    }

    nav {
        flex-grow: 1;
        align-items: end;
    }

    svg {
        width: calc(var(--base-unit)*8);
        height: calc(var(--base-unit)*8);
    }

    img {
        border-radius: 100%;
        width: calc(var(--base-unit)*8);
    }

    aside {
        background-color: var(--solid-purple);
        min-height: 200px;
        min-width: 200px;
        display: none;
        position: absolute;
        right: 0;
        color: var(--off-white);
    }
    
    .visible {
        display: block;
    }
</style>

<script setup lang="ts">
import { ref } from 'vue';
import Loama from '../assets/loama.svg'
import { store } from '@/store';
import router from '@/router';
const props = defineProps<{
    pfpSrc: string,

}>()

const isContextMenuOpen = ref(false)
console.log(store.usedPod)

const session = store.session;
async function logout() {
    session.logout();
    router.push('/'); 
}
function showContextMenu() {
    isContextMenuOpen.value = !isContextMenuOpen.value
}
</script>