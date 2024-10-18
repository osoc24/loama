<template>
    <div class="container">
        <div class="header">
            <LoInput v-model="webId" name="webid" label="Web ID" />
            <Select v-model="selectedPodUrl" :options="podUrls" />
        </div>
        <Tree v-model:selectionKeys="selectedEntries" :value="requestableFiles" selectionMode="checkbox"
            class="w-full md:w-[30rem]" />
        <LoButton>Request Access</LoButton>
    </div>
</template>
<script setup lang="ts">
import LoInput from '@/components/LoInput.vue';
import { getDefaultSession } from '@inrupt/solid-client-authn-browser';
import { createBasicController, type ResourceAccessRequestNode } from 'loama-controller';
import { ref, watch } from 'vue';
import Select from 'primevue/select';
import { listWebIdPodUrls } from 'loama-common';
import Tree, { type TreeSelectionKeys } from 'primevue/tree';
import type { TreeNode } from 'primevue/treenode';
import { debounce } from '@/lib/utils';
import LoButton from '@/components/LoButton.vue';

const webId = ref("");
const podUrls = ref<string[]>([]);
const selectedPodUrl = ref<string>("");
const selectedEntries = ref<TreeSelectionKeys>({});
const requestableFiles = ref<TreeNode[]>([]);
const controller = ref(createBasicController());
const debouncedPodFetcher = debounce(async (newVal: string) => {
    const session = getDefaultSession();
    let pods = await listWebIdPodUrls(newVal, session.fetch);
    podUrls.value = pods;
}, 1000)

const accessRequestNodeToTreeNode = (key: string, node: ResourceAccessRequestNode): TreeNode => {
    return {
        key: node.resourceUrl,
        label: key,
        selectable: node.canRequestAccess,
        children: node.children ? Object.entries(node.children).map(([k, node]) => accessRequestNodeToTreeNode(k, node)) : undefined,
    }
};

watch(webId, async (newVal) => {
    debouncedPodFetcher(newVal);
})

watch(selectedPodUrl, async (newPodUrl) => {
    controller.value.setPodUrl(newPodUrl);
    const podNode = await controller.value.AccessRequest().getRequestableResources(newPodUrl);
    requestableFiles.value = [
        accessRequestNodeToTreeNode(newPodUrl, podNode),
    ];
});

</script>
<style lang="scss" scoped>
.container {
    padding: .5rem;

    &>*:not(:first-child) {
        margin-top: .5rem;
    }
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
