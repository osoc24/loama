import { Access, AccessModes, getGroupAccessAll, getResourceInfoWithAcl, getSolidDataset, getThingAll } from "@inrupt/solid-client";
import { BaseSubject, IndexItem, Permission, ResourcePermissions } from "../../types";
import { IPermissionManager } from "../../types/modules";
import { getAgentAccessAll, getPublicAccess, setAgentAccess, setPublicAccess } from "@inrupt/solid-client/universal";
import { getDefaultSession } from "@inrupt/solid-client-authn-browser";
import "core-js/proposals/set-methods-v2"

const ACCESS_MODES_TO_PERMISSION_MAPPING: Record<keyof (AccessModes & Access), Permission> = {
    read: Permission.Read,
    write: Permission.Write,
    append: Permission.Append,
    control: Permission.Control,
    controlRead: Permission.Control,
    controlWrite: Permission.Control,
}

export class InruptPermissionManager<T extends Record<keyof T, BaseSubject<keyof T>>> implements IPermissionManager<T> {
    // This is a replacement for https://github.com/inrupt/solid-client-js/blob/eb8e86f61458ec76fa2244f7b38b7d7983bbd810/src/access/wac.ts#L262 because it is not exposed in the inrupt library
    private async getGroupAccessAll(resource: string): Promise<Record<string, Access> | null> {
        const session = getDefaultSession();
        const resourceInfo = await getResourceInfoWithAcl(resource, {
            fetch: session.fetch,
        });
        return getGroupAccessAll(resourceInfo)
    }

    private async updateACL(resource: string, subject: S, accessModes: Partial<AccessModes>) {
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
        return Object.entries(accessModes).map(([mode, isActive]) => {
            if (isActive) {
                return ACCESS_MODES_TO_PERMISSION_MAPPING[mode as keyof (AccessModes & Access)];
            }
        }).filter(p => p !== undefined);
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
                    accessModes.write = hasAccess;

                    // Setting Write also enables Append, but removing Write doesn't remove Append
                    if (hasAccess === false) {
                        accessModes.append = false;
                    }
                    break;
            }
        }

        for (const permission of addedPermissions) {
            addToAccessModes(permission, true);
        }
        for (const permission of removedPermissions) {
            addToAccessModes(permission, false);
        }

        return accessModes;
    }

    //. NOTE: Currently, it doesn't do any recursive permission setting on containers
    async createPermissions(resource: string, subject: S, permissions: Permission[]): Promise<void> {
        const accessModes = this.permissionsToAccessModes(permissions, []);
        await this.updateACL(resource, subject, accessModes);
    }

    async editPermissions(resource: string, item: IndexItem, subject: S, permissions: Permission[]): Promise<void> {
        // 1. make diff with index to see what to create/update/delete, per resource
        const oldPermissionsSet = new Set(item.permissions);
        const newPermissionsSet = new Set(permissions);
        const addedPermissions = newPermissionsSet.difference(oldPermissionsSet);
        const removedPermissions = oldPermissionsSet.difference(newPermissionsSet);

        const accessModes = this.permissionsToAccessModes(addedPermissions, removedPermissions);
        await this.updateACL(resource, subject, accessModes);
    }

    async getRemotePermissions(resourceUrl: string): Promise<ResourcePermissions<S>> {
        const session = getDefaultSession();
        const agentAccess = await getAgentAccessAll(resourceUrl, { fetch: session.fetch });
        const publicAccess = await getPublicAccess(resourceUrl, { fetch: session.fetch })
        const groupAccess = await this.getGroupAccessAll(resourceUrl)

        const remotePermissions: ResourcePermissions<S> = {
            resourceUrl,
            permissionsPerSubject: []
        }

        if (publicAccess) {
            remotePermissions.permissionsPerSubject.push({
                subject: {
                    type: "public"
                } as S,
                permissions: this.AccessModesToPermissions(publicAccess)
            })
        };
        if (agentAccess) {
            Object.entries(agentAccess).forEach(([url, access]) => {
                remotePermissions.permissionsPerSubject.push({
                    subject: {
                        type: "webId",
                        selector: { url },
                    } as S,
                    permissions: this.AccessModesToPermissions(access)
                })
            })
        }
        if (groupAccess) {
            Object.entries(groupAccess).forEach(([url, access]) => {
                remotePermissions.permissionsPerSubject.push({
                    subject: {
                        type: "group",
                        selector: { url }
                    } as S,
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
