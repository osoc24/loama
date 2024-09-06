<template>
    <div class="text-input">
        <label for="webid">
            WebId
        </label>
        <InputText type="text" id="webid" placeholder="https://pod.example.com/user1/profile/card#me" v-model="webId" />
    </div>
</template>
<script setup lang="ts">
import { usePodStore } from '@/lib/state';
import { Permission, activeController } from 'loama-controller';
import InputText from 'primevue/inputtext';
import { useToast } from 'primevue/usetoast';
import { ref } from 'vue';
const webId = ref("");

const toast = useToast();
const podStore = usePodStore();

const onCreate = async () => {
    if (!podStore.selectedEntry) {
        console.error("No entry selected to add subject to!")
        return true;
    }
    if (!webId.value || webId.value == "") {
        console.error("WebId is required")
        toast.add({ severity: "warn", summary: "The webId field is required" })
        return false;
    }
    const entry = await activeController.getItem(podStore.selectedEntry.resourceUrl, {
        type: "webId",
        selector: {
            url: webId.value
        }
    });
    if (entry) {
        console.log("This webId was already added")
        toast.add({ severity: "warn", summary: "The webId is already present in the permission table" })
        return true;
    }
    try {
        await activeController.addPermission(podStore.selectedEntry.resourceUrl, Permission.Read, {
            type: "webId",
            selector: {
                url: webId.value
            }
        })
        await podStore.refreshEntryPermissions();
        return true;
    } catch (e) {
        console.error(e)
        toast.add({ severity: "error", summary: "An error occurred while adding the new webId", detail: (e instanceof Error) ? e.message : "An unknown error occurred" })
        return false;
    }
}

defineExpose({
    create: onCreate
})

</script>
<style scoped>
.text-input {
    display: flex;
    flex-direction: column;
    gap: .5rem;
}
</style>
