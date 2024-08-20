import { BaseSubject, Permission } from "../types";
import { IAccessManagement, IPermissionManager, IStore, ISubjectResolver } from "./types";

export class AccessManagement implements IAccessManagement {
    private store: IStore
    // NOTE: useing BaseSubject will possibly block me in the builder
    private subjectResolvers: Record<string, ISubjectResolver<BaseSubject>>;
    private permissionManager: IPermissionManager

    constructor(store: IStore, pm: IPermissionManager, subjectResolvers: Record<string, ISubjectResolver<BaseSubject>>) {
        this.store = store;
        this.permissionManager = pm;
        this.subjectResolvers = subjectResolvers;
    }

    private async getExistingPermissions<T extends BaseSubject>(resourceUrl: string, subject: T): Promise<Permission[]> {
        const item = await this.getItem(resourceUrl, subject);
        if (item) {
            // Makeing sure the array is not a reference to the one stored in the index
            return [...item.permissions]
        }

        const { permissionsPerSubject } = await this.permissionManager.getRemotePermissions(resourceUrl);
        const subjectResolver = this.subjectResolvers[subject.type];
        if (!subjectResolver) {
            throw new Error(`No resolver found for subject type ${subject.type}`);
        }
        const subjectPermission = permissionsPerSubject.find(entry => subjectResolver.checkMatch(entry.subject, subject))

        return [...subjectPermission?.permissions ?? []]
    }

    setPodUrl(podUrl: string) {
        this.store.setPodUrl(podUrl);
    }

    unsetPodUrl() {
        this.store.unsetPodUrl();
    }

    async getOrCreateIndex() {
        return this.store.getOrCreateIndex();
    }

    async getItem<T extends BaseSubject>(resourceUrl: string, subject: T) {
        const resolver = this.subjectResolvers[subject.type];
        if (!resolver) {
            throw new Error(`No resolver found for subject type ${subject.type}`);
        }

        const index = await this.store.getOrCreateIndex();
        return resolver.getItem(index, resourceUrl, subject.selector)
    }

    // NOTE: to self: Do not forget to also push changes tot the stored index, this is not a responsibilty from the PermissionManager
    async addPermission<T extends BaseSubject>(resourceUrl: string, addedPermission: Permission, subject: T) {
        return []
    }

    async removePermission<T extends BaseSubject>(resourceUrl: string, addedPermission: Permission, subject: T) {
        return []
    }

    async enablePermissions<T extends BaseSubject>(resource: string, subject: T) { }

    async disablePermissions<T extends BaseSubject>(resource: string, subject: T) { }
}
