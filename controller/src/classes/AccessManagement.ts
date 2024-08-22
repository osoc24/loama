import { BaseSubject, Permission, ResourcePermissions } from "../types";
import { EnforceKeyMatchResolver, IAccessManagement, IPermissionManager, IStore, ISubjectResolver, SubjectKey, SubjectType } from "../types/modules";

export class AccessManagement<T extends Record<keyof T, BaseSubject<keyof T & string>>> implements IAccessManagement<T> {
    private store: IStore
    private subjectResolvers: EnforceKeyMatchResolver<T>
    private permissionManager: IPermissionManager<T>

    constructor(store: IStore, subjectResolvers: EnforceKeyMatchResolver<T>, pm: IPermissionManager<T>) {
        this.store = store;
        this.permissionManager = pm;
        this.subjectResolvers = subjectResolvers;
    }

    private async getExistingPermissions<K extends SubjectKey<T>>(resourceUrl: string, subject: T[K]): Promise<Permission[]> {
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

    private async updateItem<K extends SubjectKey<T>>(resourceUrl: string, subject: SubjectType<T, K>, permissions: Permission[]) {
        let item = await this.getItem(resourceUrl, subject);

        if (item) {
            await this.permissionManager.editPermissions(resourceUrl, item, subject, permissions);
        } else {
            await this.permissionManager.createPermissions(resourceUrl, subject, permissions);

            item = {
                id: crypto.randomUUID(),
                requestId: crypto.randomUUID(),
                isEnabled: true,
                permissions: permissions,
                resource: resourceUrl,
                subject: subject,
            }

            const index = await this.store.getCurrentIndex();
            index.items.push(item);
        }

        // TODO: Check if this actually works (should be because it's a reference)
        item.permissions = permissions;

        await this.store.saveToRemoteIndex();
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

    async enablePermissions<K extends SubjectKey<T>>(resource: string, subject: SubjectType<T, K>) {
        const item = await this.getItem(resource, subject);
        if (!item) {
            // This point should never be reached
            throw new Error("Item not found after disabling permissions")
        }

        item.isEnabled = true;
        await this.updateItem(resource, subject, item.permissions)

        await this.store.saveToRemoteIndex()
    }

    async disablePermissions<K extends SubjectKey<T>>(resource: string, subject: SubjectType<T, K>) {
        await this.updateItem(resource, subject, [])

        const item = await this.getItem(resource, subject);
        if (!item) {
            // This point should never be reached
            throw new Error("Item not found after disabling permissions")
        }

        item.isEnabled = false;

        await this.store.saveToRemoteIndex()
    }

    getContainerPermissionList(containerUrl: string): Promise<ResourcePermissions<T[keyof T]>[]> {
        return this.permissionManager.getContainerPermissionList(containerUrl);
    }
}
