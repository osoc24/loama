<template>
    <div class="text-input">
        <label for="webid">
            WebId
        </label>
        <InputText type="text" id="webid" placeholder="https://pod.example.com/user1/profile/card#me" v-model="webId" />
    </div>
</template>
<script setup lang="ts">
import { refreshEntryPermissions, selectedEntry } from '@/lib/state';
import { Permission, inruptController } from 'loama-controller';
import InputText from 'primevue/inputtext';
import { ref } from 'vue';
const webId = ref("");

const onCreate = async () => {
    if (!selectedEntry.value) {
        console.error("No entry selected to add subject to!")
        return true;
    }
    const entry = await inruptController.getItem(selectedEntry.value.resourceUrl, {
        type: "webId",
        selector: {
            url: webId.value
        }
    });
    if (entry) {
        console.log("This webid was already added")
        return true;
    }
    try {
        await inruptController.addPermission(selectedEntry.value.resourceUrl, Permission.Read, {
            type: "webId",
            selector: {
                url: webId.value
            }
        })
        await refreshEntryPermissions();
        return true;
    } catch (e) {
        console.error(e)
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
