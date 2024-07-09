<template>
  <div>
    <p>Login status: {{ session.info.isLoggedIn }}</p>
    <button type="button" @click="login" v-if="!session.info.isLoggedIn">Login</button>
    <div v-else>
      <p> {{ session.info }}</p>
      <button type="button" @click="logout">Logout</button>
      <NuxtLink to="/list">List authorized users</NuxtLink>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { getDefaultSession, handleIncomingRedirect } from "@inrupt/solid-client-authn-browser";

const session = getDefaultSession();
const idp = "https://css12.onto-deside.ilabt.imec.be/";

const login = async () => {
  try {
    await session.login({
      oidcIssuer: idp,
      redirectUrl: new URL("/", window.location.href).toString(),
      clientName: "LOAMA",
    });

  } catch (error) {
    throw new Error(`Login failed: ${error}`);
  }
}

const logout = async () => { session.logout(); navigateTo('/'); }

await callOnce(async () => await handleIncomingRedirect())
</script>

<style></style>