import { getDefaultSession } from "@inrupt/solid-client-authn-browser";
import { BaseSubject, IndexItem, Permission } from "../../../types";
import { IPermissionManager, SubjectKey } from "../../../types/modules";
import { InruptPermissionManager } from "./InruptPermissionManager";
import { getAgentAccessAll, setAgentAccess } from "@inrupt/solid-client/universal";
import { AccessModes, } from "@inrupt/solid-client";
import { cacheBustedSessionFetch } from "../../../util";

export class WebIdManager<T extends Record<keyof T, BaseSubject<keyof T & string>>> extends InruptPermissionManager<T> implements IPermissionManager<T> {
    private async updateACL<K extends SubjectKey<T>>(resource: string, subject: T[K], accessModes: Partial<AccessModes>) {
        const session = getDefaultSession();
        if (!subject.selector?.url) {
            throw new Error("Missing url selector on WebID subject")
        }
        await setAgentAccess(resource, subject.selector.url, accessModes, {
            fetch: session.fetch
        })
    }
    //. NOTE: Currently, it doesn't do any recursive permission setting on containers
    async createPermissions<K extends SubjectKey<T>>(resource: string, subject: T[K], permissions: Permission[]): Promise<void> {
        const accessModes = this.permissionsToAccessModes(permissions, []);
        await this.updateACL(resource, subject, accessModes)
    }

    async deletePermissions<K extends SubjectKey<T>>(resource: string, subject: T[K]) {
        await this.updateACL(resource, subject, {});
    }

    async editPermissions<K extends SubjectKey<T>>(resource: string, item: IndexItem, subject: T[K], permissions: Permission[]) {
        const accessModes = this.editPermissionsToAccessModes(item, permissions);
        await this.updateACL(resource, subject, accessModes)
    }

    async getRemotePermissions<K extends SubjectKey<T>>(resourceUrl: string) {
        const session = getDefaultSession();
        const agentAccess = await getAgentAccessAll(resourceUrl, { fetch: cacheBustedSessionFetch(session) });

        if (!agentAccess) {
            return [];
        }

        return Object.entries(agentAccess).map(([url, access]) => ({
            // @ts-expect-error selector is required for webId
            subject: {
                type: "webId",
                selector: { url },
            } as T[K],
            permissions: this.AccessModesToPermissions(access),
            isEnabled: true,
        }))
    }
}
