import { Access, AccessModes, getGroupAccessAll, getResourceInfoWithAcl, getSolidDataset, getThingAll } from "@inrupt/solid-client";
import { BaseSubject, IndexItem, Permission, ResourcePermissions } from "../../types";
import { IPermissionManager, SubjectKey } from "../../types/modules";
import { getAgentAccessAll, getPublicAccess, setAgentAccess, setPublicAccess } from "@inrupt/solid-client/universal";
import { getDefaultSession } from "@inrupt/solid-client-authn-browser";
import "core-js/proposals/set-methods-v2"
import { cacheBustedFetch } from "../../util";

const ACCESS_MODES_TO_PERMISSION_MAPPING: Record<keyof (AccessModes & Access), Permission> = {
    read: Permission.Read,
    write: Permission.Write,
    append: Permission.Append,
    control: Permission.Control,
    controlRead: Permission.Control,
    controlWrite: Permission.Control,
}

export class InruptPermissionManager<T extends Record<keyof T, BaseSubject<keyof T & string>>> implements IPermissionManager<T> {
    // This is a replacement for https://github.com/inrupt/solid-client-js/blob/eb8e86f61458ec76fa2244f7b38b7d7983bbd810/src/access/wac.ts#L262 because it is not exposed in the inrupt library
    private async getGroupAccessAll(resource: string): Promise<Record<string, Access> | null> {
        const session = getDefaultSession();
        const resourceInfo = await getResourceInfoWithAcl(resource, {
            fetch: cacheBustedFetch(session),
        });
        return getGroupAccessAll(resourceInfo)
    }

    private async updateACL<K extends SubjectKey<T>>(resource: string, subject: T[K], accessModes: Partial<AccessModes>) {
        const session = getDefaultSession();
        switch (subject.type) {
            case "public": {
                await setPublicAccess(resource, accessModes, {
                    fetch: session.fetch
                })
                break;
            }
            case "webId": {
                if (!subject.selector?.url) {
                    throw new Error("Missing url selector on WebID subject")
                }
                await setAgentAccess(resource, subject.selector.url, accessModes, {
                    fetch: session.fetch
                })
                break;
            }
            case "group": {
                if (!subject.selector?.url) {
                    throw new Error("Missing url selector on WebID subject")
                }
                await setAgentAccess(resource, subject.selector.url, accessModes, {
                    fetch: session.fetch
                })
                break;
            }
            default: {
                throw new Error(`Unsupported subject type ${subject.type}`);
            }
        }
    }

    private AccessModesToPermissions(accessModes: AccessModes | Access): Permission[] {
        const permissions = new Set<Permission>();
        Object.entries(accessModes).forEach(([mode, isActive]) => {
            if (isActive) {
                permissions.add(ACCESS_MODES_TO_PERMISSION_MAPPING[mode as keyof (AccessModes & Access)])
            }
        })
        return [...permissions];
    }

    private permissionsToAccessModes(addedPermissions: Iterable<Permission>, removedPermissions: Iterable<Permission>): Partial<AccessModes> {
        const accessModes: Partial<AccessModes> = {};
        const addToAccessModes = (permission: Permission, hasAccess: boolean) => {
            switch (permission) {
                case Permission.Append:
                    accessModes.append = hasAccess;
                    break;
                case Permission.Control:
                    accessModes.controlRead = hasAccess;
                    accessModes.controlWrite = hasAccess;
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

    //. NOTE: Currently, it doesn't do any recursive permission setting on containers
    async createPermissions<K extends SubjectKey<T>>(resource: string, subject: T[K], permissions: Permission[]): Promise<void> {
        const accessModes = this.permissionsToAccessModes(permissions, []);
        await this.updateACL(resource, subject, accessModes);
    }

    async editPermissions<K extends SubjectKey<T>>(resource: string, item: IndexItem, subject: T[K], permissions: Permission[]): Promise<void> {
        // 1. make diff with index to see what to create/update/delete, per resource
        const oldPermissionsSet = new Set(item.permissions);
        const newPermissionsSet = new Set(permissions);
        const addedPermissions = newPermissionsSet.difference(oldPermissionsSet);
        const removedPermissions = oldPermissionsSet.difference(newPermissionsSet);

        const accessModes = this.permissionsToAccessModes(addedPermissions, removedPermissions);
        await this.updateACL(resource, subject, accessModes);
    }

    async getRemotePermissions<K extends SubjectKey<T>>(resourceUrl: string): Promise<ResourcePermissions<T[K]>> {
        const session = getDefaultSession();
        const agentAccess = await getAgentAccessAll(resourceUrl, { fetch: cacheBustedFetch(session) });
        const publicAccess = await getPublicAccess(resourceUrl, { fetch: cacheBustedFetch(session) })
        const groupAccess = await this.getGroupAccessAll(resourceUrl)

        const remotePermissions: ResourcePermissions<T[K]> = {
            resourceUrl,
            permissionsPerSubject: []
        }

        if (publicAccess) {
            remotePermissions.permissionsPerSubject.push({
                subject: {
                    type: "public"
                } as T[K],
                permissions: this.AccessModesToPermissions(publicAccess)
            })
        };
        if (agentAccess) {
            Object.entries(agentAccess).forEach(([url, access]) => {
                remotePermissions.permissionsPerSubject.push({
                    // @ts-expect-error selector is required for webId
                    subject: {
                        type: "webId",
                        selector: { url },
                    } as T[K],
                    permissions: this.AccessModesToPermissions(access)
                })
            })
        }
        if (groupAccess) {
            Object.entries(groupAccess).forEach(([url, access]) => {
                remotePermissions.permissionsPerSubject.push({
                    // @ts-expect-error selector is required for group
                    subject: {
                        type: "group",
                        selector: { url }
                    } as T[K],
                    permissions: this.AccessModesToPermissions(access)
                })
            })
        }

        return remotePermissions;
    }

    async getContainerPermissionList(containerUrl: string) {
        const session = getDefaultSession();
        const dataset = await getSolidDataset(containerUrl, { fetch: session.fetch });
        // NOTE: can probably be optimized
        return Promise.all(
            getThingAll(dataset)
                .map(async (resource) => (await this.getRemotePermissions(resource.url)))
        )
    }
}
