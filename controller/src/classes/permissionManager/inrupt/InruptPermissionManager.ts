import { Access, AccessModes, getSolidDataset, getThingAll } from "@inrupt/solid-client";
import { SubjectPermissions, BaseSubject, IndexItem, Permission, ResourcePermissions } from "../../../types";
import { SubjectKey } from "../../../types/modules";
import { getDefaultSession } from "@inrupt/solid-client-authn-browser";

const ACCESS_MODES_TO_PERMISSION_MAPPING: Record<keyof (AccessModes & Access), Permission> = {
    read: Permission.Read,
    write: Permission.Write,
    append: Permission.Append,
    control: Permission.Control,
    controlRead: Permission.Control,
    controlWrite: Permission.Control,
}


/**
 * A permission manager implementation using the inrupt sdk to actually update the ACL
 * The "Inrupt" prefix is to indicate the usage of the inrupt sdk
 * This permission manager can be used without the the InruptStore
*/
export abstract class InruptPermissionManager<T extends Record<keyof T, BaseSubject<keyof T & string>>> {

    protected AccessModesToPermissions(accessModes: AccessModes | Access): Permission[] {
        const permissions = new Set<Permission>();
        Object.entries(accessModes).forEach(([mode, isActive]) => {
            if (isActive) {
                permissions.add(ACCESS_MODES_TO_PERMISSION_MAPPING[mode as keyof (AccessModes & Access)])
            }
        })
        return [...permissions];
    }

    protected permissionsToAccessModes(addedPermissions: Iterable<Permission>, removedPermissions: Iterable<Permission>): Partial<AccessModes> {
        const accessModes: Partial<AccessModes> = {};
        const addToAccessModes = (permission: Permission, hasAccess: boolean) => {
            switch (permission) {
                case Permission.Append:
                    accessModes.append = hasAccess;
                    break;
                case Permission.Control:
                    accessModes.controlRead = hasAccess;
                    accessModes.controlWrite = hasAccess;
                    break;
                case Permission.Read:
                    accessModes.read = hasAccess;
                    break;
                case Permission.Write:
                    // Setting Write also enables Append, so we make append inherintly true
                    // This will also disable append when write is taken away
                    accessModes.write = hasAccess;
                    accessModes.append = hasAccess;
                    break;
            }
        }

        // First the removed ones so we can e.g. remove write and add append
        for (const permission of removedPermissions) {
            addToAccessModes(permission, false);
        }
        for (const permission of addedPermissions) {
            addToAccessModes(permission, true);
        }

        return accessModes;
    }


    protected editPermissionsToAccessModes(item: IndexItem, permissions: Permission[]) {
        const oldPermissionsSet = [...new Set(item.permissions)];
        const newPermissionsSet = [...new Set(permissions)];
        const addedPermissions = newPermissionsSet.filter(p => !oldPermissionsSet.includes(p));
        const removedPermissions = oldPermissionsSet.filter(p => !newPermissionsSet.includes(p));

        const accessModes = this.permissionsToAccessModes(addedPermissions, removedPermissions);
        return accessModes;
    }

    abstract getRemotePermissions<K extends SubjectKey<T>>(resourceUrl: string): Promise<SubjectPermissions<T[K]>[]>

    async getContainerPermissionList(containerUrl: string, resourceToSkip: string[] = []) {
        const session = getDefaultSession();
        // this request is cached, so it doesn't matter if it's emitted multiple times in a short span
        const dataset = await getSolidDataset(containerUrl, { fetch: session.fetch });
        const results = await Promise.allSettled(
            getThingAll(dataset)
                .filter(r => !resourceToSkip?.includes(r.url))
                .map(async (resource) => ({
                    resourceUrl: resource.url,
                    permissionsPerSubject: await this.getRemotePermissions(resource.url)
                }))
        )
        return results.reduce<ResourcePermissions<T[keyof T]>[]>((arr, v) => {
            if (v.status == "fulfilled") {
                arr.push(v.value);
            }
            return arr;
        }, [])

    }

    shouldDeleteOnAllRevoked() { return true }
}
