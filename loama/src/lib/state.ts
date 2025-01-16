import type { Entry } from "./types";
import { activeController, type PublicSubject, type ResourcePermissions, type WebIdSubject } from "loama-controller";
import { defineStore } from "pinia";
import { store } from "loama-app";
import { uriToName } from "@/lib/utils"
import { PhLock, PhLockOpen } from "@phosphor-icons/vue";


type PodStore = {
    podEntries: ResourcePermissions<WebIdSubject | PublicSubject>[];
    selectedEntry: Entry | null;
}

export const usePodStore = defineStore("pod", {
    state: (): PodStore => ({
        selectedEntry: null,
        podEntries: [],
    }),
    getters: {
        formattedEntries(state) {
            return state.podEntries.map(resourcePermissions => {
                const uri = resourcePermissions.resourceUrl.replace(store.usedPod, '');
                const isContainer = uri.charAt(uri.length - 1) === '/'
                const name = uriToName(uri, isContainer);
                const publicAccess = (resourcePermissions.permissionsPerSubject.find(s => s.subject.type === "public")?.permissions.length ?? 0) > 0;
                return {
                    isContainer,
                    name,
                    public: {
                        access: publicAccess,
                        icon: (publicAccess) ? PhLockOpen : PhLock
                    },
                    ...resourcePermissions
                }
            })
        }
    },
    actions: {
        async loadResources(url: string) {
            this.podEntries = (await activeController.getContainerPermissionList(url))
                // Filter out the current resource
                .filter(entry => entry.resourceUrl !== url)
                // Filter out the things that are nested (?)
                .filter(entry => {
                    const depth = entry.resourceUrl.replace(url, '').split('/');
                    return depth.length <= 2;
                })
        },
        async refreshEntryPermissions() {
            if (!this.selectedEntry) {
                throw new Error('No selected entry to update permissions for');
            }
            const newResourceInfo = await activeController.getResourcePermissionList(this.selectedEntry.resourceUrl);
            this.selectedEntry.permissionsPerSubject = newResourceInfo.permissionsPerSubject;
        },
        async refreshRequestAccessAllowance() {
            if (!this.selectedEntry) {
                throw new Error('No selected entry to update permissions for');
            }
            this.selectedEntry.canRequestAccess = await activeController.AccessRequest().canRequestAccessToResource(this.selectedEntry.resourceUrl);
        }
    }
})
