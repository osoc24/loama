import { BaseSubject, Permission, ResourcePermissions } from "../../types";
import { IPermissionManager } from "../types";

export class InruptPermissionManager implements IPermissionManager {
    /**
     * NOTE: Currently, it doesn't do any recursive permission setting on containers
     *
     * Side effects:
     * - The remote ACL is updated
     */
    async createPermissions<T extends BaseSubject>(resource: string, subject: T, permissions: Permission[]): Promise<void> { }

    async editPermissions<T extends BaseSubject>(resource: string, subject: T, permissions: Permission[]): Promise<void> {

    }

    getRemotePermissions<T extends BaseSubject>(resourceUrl: string): Promise<ResourcePermissions<T>> {
        throw new Error("Method unimplemented")
    }
}
