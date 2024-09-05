<script setup lang="ts">
import { usePodStore } from '@/lib/state';
import { Permission, activeController } from 'loama-controller';
import { useToast } from 'primevue/usetoast';

const toast = useToast();
const podStore = usePodStore();

const onCreate = async () => {
    if (!podStore.selectedEntry) {
        console.error("No entry selected to add subject to!")
        return true;
    }
    const entry = await activeController.getItem(podStore.selectedEntry.resourceUrl, {
        type: "public",
    });
    if (entry) {
        console.log("The public is already added")
        toast.add({ severity: "warn", summary: "The public is already present in the permission table" })
        return true;
    }
    try {
        await activeController.addPermission(podStore.selectedEntry.resourceUrl, Permission.Read, {
            type: "public"
        })
        await podStore.refreshEntryPermissions();
        return true;
    } catch (e) {
        console.error(e)
        toast.add({ severity: "error", summary: "An error occurred while adding the public", detail: (e instanceof Error) ? e.message : "An unknown error occurred" })
        return false;
    }
}

defineExpose({
    create: onCreate
})
</script>
