import { AccessModes, getSolidDataset, getThingAll } from "@inrupt/solid-client";
import { BaseSubject, IndexItem, Permission, ResourcePermissions } from "../../../types";
import { IPermissionManager, SubjectKey } from "../../../types/modules";
import { InruptPermissionManager } from "./InruptPermissionManager";
import { getDefaultSession } from "@inrupt/solid-client-authn-browser";
import { getPublicAccess, setPublicAccess } from "@inrupt/solid-client/universal";
import { cacheBustedFetch } from "../../../util";

export class PublicManager<T extends Record<keyof T, BaseSubject<keyof T & string>>> extends InruptPermissionManager<T> implements IPermissionManager<T> {

    private async updateACL<K extends SubjectKey<T>>(resource: string, subject: T[K], accessModes: Partial<AccessModes>) {
        const session = getDefaultSession();
        await setPublicAccess(resource, accessModes, {
            fetch: session.fetch
        })
    }

    //. NOTE: Currently, it doesn't do any recursive permission setting on containers
    async createPermissions<K extends SubjectKey<T>>(resource: string, subject: T[K], permissions: Permission[]): Promise<void> {
        const accessModes = this.permissionsToAccessModes(permissions, []);
        await this.updateACL(resource, subject, accessModes)
    }

    async editPermissions<K extends SubjectKey<T>>(resource: string, item: IndexItem, subject: T[K], permissions: Permission[]) {
        const accessModes = this.editPermissionsToAccessModes(item, permissions);
        await this.updateACL(resource, subject, accessModes)
    }

    async getRemotePermissions<K extends SubjectKey<T>>(resourceUrl: string) {
        const session = getDefaultSession();
        const publicAccess = await getPublicAccess(resourceUrl, { fetch: cacheBustedFetch(session) })

        if (!publicAccess) {
            return [];
        }

        return [{
            subject: {
                type: "public",
            } as T[K],
            permissions: this.AccessModesToPermissions(publicAccess)
        }]
    }
}
