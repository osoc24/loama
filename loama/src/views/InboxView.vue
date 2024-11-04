<template>
    <Suspense>
        <div class="container">
            <div>
                <RequestInbox />
            </div>
            <div>
                <h3>Accepted request</h3>
            </div>
        </div>
        <template #fallback>
            <FallbackExplorer>Loading access requests...</FallbackExplorer>
        </template>
    </Suspense>
</template>

<script lang="ts" setup>
import FallbackExplorer from '@/components/explorer/FallbackExplorer.vue';
import RequestInbox from '@/components/inbox/RequestInbox.vue';

</script>
<style scoped lang="scss">
.container {
    display: flex;
    height: calc(100vh - var(--base-unit)*14);

    &>*:first-child {
        border-right: 0.25rem solid var(--solid-purple);
    }

    &>* {
        flex: 1;
        height: 100%;
        padding: .5rem;
        text-align: center;
    }
}
</style>
