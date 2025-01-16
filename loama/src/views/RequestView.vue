<template>
    <div class="container">
        <div class="header">
            <div>
                <label class="input-label" for="webid">
                    <span>Web ID </span>
                    <RequestWebIdPopup title="Target Web Id"
                        message="The web ID url where you want to request access to files." />
                </label>
                <LoInput v-model="webId" name="webid" />
            </div>
            <div>
                <label class="input-label" for="webid">
                    <span>Pod</span>
                    <RequestWebIdPopup title="Target pod"
                        message="Select one of the pods (retrieved from the given web Id). The pods should have access requestable resources" />
                </label>
                <Select name="pod-url" v-model="selectedPodUrl" :options="podUrls" placeholder="Select a pod URL" />
            </div>
        </div>
        <Tree v-model:selectionKeys="selectedEntries" :value="requestableFiles" selectionMode="checkbox"
            class="w-full md:w-[30rem]" v-if="requestableFiles.length > 0" />
        <div v-else-if="selectedPodUrl !== '' && requestableFiles.length === 0">
            <p>This pod doesn't contain any files which you can request access to</p>
        </div>
        <div v-else>
            <p>No pod selected!</p>
        </div>
        <div class="permission-box" v-if="Object.keys(selectedEntries).length > 0">
            <LoSwitch v-for="perm in allPermissions" :key="perm" :id="perm" :default-value="false"
                @update:checked="checked => requestedPermissions[perm] = checked">
                {{ perm }}
            </LoSwitch>
        </div>
        <LoButton @click="sendRequestNotification" :disabled="Object.keys(selectedEntries).length < 1">Request Access
        </LoButton>
    </div>
</template>
<script setup lang="ts">
import LoInput from '@/components/LoInput.vue';
import { getDefaultSession } from '@inrupt/solid-client-authn-browser';
import { Permission, createBasicController, type ResourceAccessRequestNode } from 'loama-controller';
import { ref, watch } from 'vue';
import Select from 'primevue/select';
import { listWebIdPodUrls } from 'loama-common';
import Tree, { type TreeSelectionKeys } from 'primevue/tree';
import type { TreeNode } from 'primevue/treenode';
import { allPermissions, debounce } from '@/lib/utils';
import LoButton from '@/components/LoButton.vue';
import { useToast } from 'primevue/usetoast';
import RequestWebIdPopup from '@/components/popups/RequestWebIdPopup.vue';
import LoSwitch from '@/components/LoSwitch.vue';

const toast = useToast();

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
const requestedPermissions = ref({
    [Permission.Read]: false,
    [Permission.Write]: false,
    [Permission.Append]: false,
    [Permission.Control]: false,
})

const accessRequestNodeToTreeNode = (key: string, node: ResourceAccessRequestNode): TreeNode => {
    return {
        key: node.resourceUrl,
        label: key,
        selectable: node.canRequestAccess,
        children: node.children ? Object.entries(node.children).map(([k, node]) => accessRequestNodeToTreeNode(k, node)) : undefined,
    }
};

const sendRequestNotification = async () => {
    const session = getDefaultSession();
    const checkedEntries = Object.keys(selectedEntries.value).filter(k => selectedEntries.value[k].checked)
    const permissions = Object.entries(requestedPermissions.value).filter(([_, checked]) => checked).map(([perm, _]) => perm as Permission)

    try {
        await controller.value.AccessRequest().sendRequestNotification(session.info.webId!, checkedEntries, permissions)
        toast.add({
            severity: "success",
            summary: "Access request(s) sent to user",
            life: 3000,
        })
    } catch (e) {
        console.error(e);
        toast.add({
            severity: "error",
            summary: `Failed to send access request: ${e instanceof Error ? e.message : e}`,
            life: 3000,
        })
    }
}

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

    & .p-select {
        height: min-content;
        width: 100%;
    }

    & .input-label {
        display: flex;
    }
}

.permission-box {
    display: flex;
    padding: .5em;
    border-radius: 1em;
    background: white;
}
</style>
