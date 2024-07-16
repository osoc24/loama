<template>
    <div>
        <p>This is a very cool landing page, wowsies!</p>
        <button @click="login">Login</button>
    </div>
</template>

<script setup lang="ts">
import { store } from "@/store";

const idp = "https://hatapon.solidweb.org/";

const login = async () => {
    try {
        await store.session.login({
            oidcIssuer: idp,
            redirectUrl: new URL("/home", window.location.href).toString(),
            clientName: "LOAMA",
        });

    } catch (error) {
        throw new Error(`Login failed: ${error}`);
    }
}
</script>