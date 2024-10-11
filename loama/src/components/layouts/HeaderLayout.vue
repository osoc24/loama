<template>
    <Suspense>
        <HeaderBase>
            <HeaderTab href="/home/" active>Resources</HeaderTab>
            <HeaderTab href="/request" active>Request access</HeaderTab>
        </HeaderBase>
    </Suspense>
    <router-view />
</template>
<script setup lang='ts'>
import HeaderTab from "@/components/header/HeaderTab.vue";
import HeaderBase from '@/components/header/HeaderBase.vue'
</script>
