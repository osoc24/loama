<template>
    <div class="container">
        <div class="header">
            <LoInput v-model="webId" name="webid" label="Web ID" />
            <Select v-model="selectedPodUrl" :options="podUrls" />
        </div>
        <Tree v-model:selectionKeys="selectedEntries" :value="requestableFiles" @node-expand="onNodeExpand"
            selectionMode="checkbox" class="w-full md:w-[30rem]"></Tree>
    </div>
</template>
<script setup lang="ts">
import LoInput from '@/components/LoInput.vue';
import { getDefaultSession } from '@inrupt/solid-client-authn-browser';
import { createBasicController } from 'loama-controller';
import { ref, watch } from 'vue';
import Select from 'primevue/select';
import { listWebIdPodUrls } from 'loama-common';
import Tree, { type TreeSelectionKeys } from 'primevue/tree';
import type { TreeNode } from 'primevue/treenode';

const webId = ref("");
const podUrls = ref<string[]>([]);
const selectedPodUrl = ref<string>("");
const selectedEntries = ref<TreeSelectionKeys>({});
const requestableFiles = ref<TreeNode[]>([]);
const controller = ref(createBasicController());

const onNodeExpand = (node: TreeNode) => {

}

watch(webId, async (newVal) => {
    const session = getDefaultSession();
    let pods = await listWebIdPodUrls(newVal, session.fetch);
    podUrls.value = pods;
})

watch(selectedPodUrl, (newPodUrl) => {
    controller.value.setPodUrl(newPodUrl);
    // TODO: Only fetch the files where we can request access to
    const files = controller.value.getContainerPermissionList(newPodUrl);
});

</script>
<style scoped>
.container {
    padding: .5rem;
}

.header {
    display: flex;
    align-items: end;
    justify-content: space-between;
    gap: .5rem;

    &>* {
        width: 100%;
    }

    &>.p-select {
        height: min-content;
    }
}
</style>
