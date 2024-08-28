import { ref } from "vue";
import type { Entry } from "./types";
import { inruptController } from "loama-controller";

export const selectedEntry = ref<Entry | null>(null)

export const refreshEntryPermissions = async () => {
    if (!selectedEntry.value) {
        throw new Error('No selected entry to update permissions for');
    }
    const newResourceInfo = await inruptController.getResourcePermissionList(selectedEntry.value.resourceUrl);
    selectedEntry.value.permissionsPerSubject = newResourceInfo.permissionsPerSubject;
}
