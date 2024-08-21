import { BaseSubject, Permission } from "../types";
import { IAccessManagement, IPermissionManager, IStore, ISubjectResolver, SubjectKey, SubjectType } from "../types/modules";

export class AccessManagement<T extends Record<keyof T, BaseSubject<keyof T & string>>> implements IAccessManagement<T> {
    private store: IStore
    private subjectResolvers: Record<keyof T, ISubjectResolver<keyof T & string>>;
    private permissionManager: IPermissionManager<T>

    constructor(store: IStore, pm: IPermissionManager<T>, subjectResolvers: Record<keyof T, ISubjectResolver<keyof T & string>>) {
        this.store = store;
        this.permissionManager = pm;
        this.subjectResolvers = subjectResolvers;
    }

    private async getExistingPermissions<K extends SubjectKey<T>>(resourceUrl: string, subject: SubjectType<T, K>): Promise<Permission[]> {
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

    async getItem<K extends SubjectKey<T>>(resourceUrl: string, subject: SubjectType<T, K>) {
        const resolver = this.subjectResolvers[subject.type];
        if (!resolver) {
            throw new Error(`No resolver found for subject type ${subject.type}`);
        }

        const index = await this.store.getOrCreateIndex();
        return resolver.getItem(index, resourceUrl, subject.selector)
    }

    // NOTE: to self: Do not forget to also push changes tot the stored index, this is not a responsibilty from the PermissionManager
    async addPermission<K extends SubjectKey<T>>(resourceUrl: string, addedPermission: Permission, subject: SubjectType<T, K>) {
        return []
    }

    async removePermission<K extends SubjectKey<T>>(resourceUrl: string, addedPermission: Permission, subject: SubjectType<T, K>) {
        return []
    }

    async enablePermissions<K extends SubjectKey<T>>(resource: string, subject: SubjectType<T, K>) { }

    async disablePermissions<K extends SubjectKey<T>>(resource: string, subject: SubjectType<T, K>) { }
}
