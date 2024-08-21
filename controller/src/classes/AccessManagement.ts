import { BaseSubject, Permission } from "../types";
import { IAccessManagement, IPermissionManager, IStore, ISubjectResolver, SubjectKey, SubjectType } from "../types/modules";

export class AccessManagement<T extends Record<keyof T, S>, S extends BaseSubject<keyof T & string> = BaseSubject<keyof T & string>> implements IAccessManagement<T> {
    private store: IStore
    private subjectResolvers: Record<keyof T, ISubjectResolver<keyof T & string>>;
    private permissionManager: IPermissionManager<S>

    constructor(store: IStore, pm: IPermissionManager<S>, subjectResolvers: Record<keyof T, ISubjectResolver<keyof T & string>>) {
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

    // TODO: Add index updating (+ pushing to remote)
    private async updateItem<K extends SubjectKey<T>>(resourceUrl: string, subject: SubjectType<T, K>, permissions: Permission[]) {
        const item = await this.getItem(resourceUrl, subject);

        if (item) {
            await this.permissionManager.editPermissions(resourceUrl, item, subject, permissions);
        } else {
            await this.permissionManager.createPermissions(resourceUrl, subject, permissions);
        }
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

    async addPermission<K extends SubjectKey<T>>(resourceUrl: string, addedPermission: Permission, subject: SubjectType<T, K>) {
        let permissions = await this.getExistingPermissions(resourceUrl, subject);

        if (permissions.indexOf(addedPermission) !== -1) {
            return permissions;
        }

        permissions.push(addedPermission)

        await this.updateItem(resourceUrl, subject, permissions)
        return permissions;
    }

    async removePermission<K extends SubjectKey<T>>(resourceUrl: string, removedPermission: Permission, subject: SubjectType<T, K>) {
        let oldPermissions = await this.getExistingPermissions(resourceUrl, subject);
        let newPermissions = oldPermissions.filter((p) => p !== removedPermission);

        if (newPermissions.length === oldPermissions.length) {
            return oldPermissions;
        }

        await this.updateItem(resourceUrl, subject, newPermissions)
        return newPermissions;
    }

    async enablePermissions<K extends SubjectKey<T>>(resource: string, subject: SubjectType<T, K>) { }

    async disablePermissions<K extends SubjectKey<T>>(resource: string, subject: SubjectType<T, K>) { }
}
