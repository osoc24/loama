<script setup lang="ts">
import { refreshEntryPermissions, selectedEntry } from '@/lib/state';
import { Permission, activeController } from 'loama-controller';
import { useToast } from 'primevue/usetoast';
const toast = useToast();

const onCreate = async () => {
  if (!selectedEntry.value) {
    console.error("No entry selected to add subject to!")
    return true;
  }
  const entry = await activeController.getItem(selectedEntry.value.resourceUrl, {
    type: "public",
  });
  if (entry) {
    console.log("The public is already added")
    toast.add({ severity: "warn", summary: "The public is already present in the permission table" })
    return true;
  }
  try {
    await activeController.addPermission(selectedEntry.value.resourceUrl, Permission.Read, {
      type: "public"
    })
    await refreshEntryPermissions();
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
