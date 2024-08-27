import { BaseSubject, Permission, ResourcePermissions } from "../types";
import { EnforceKeyMatchResolver, IController, IPermissionManager, IStore, SubjectKey, SubjectType } from "../types/modules";
import { Mutex } from "./utils/Mutex";

export class Controller<T extends Record<keyof T, BaseSubject<keyof T & string>>> extends Mutex implements IController<T> {
    private store: IStore
    private subjectResolvers: EnforceKeyMatchResolver<T>
    private permissionManager: IPermissionManager<T>

    constructor(store: IStore, subjectResolvers: EnforceKeyMatchResolver<T>, pm: IPermissionManager<T>) {
        super();
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

    getLabelForSubject<K extends SubjectKey<T>>(subject: T[K]): string {
        if (!this.subjectResolvers[subject.type]) {
            throw new Error(`No resolver found for subject type ${subject.type}`);
        }
        return this.subjectResolvers[subject.type].toLabel(subject);
    }

    async getItem<K extends SubjectKey<T>>(resourceUrl: string, subject: SubjectType<T, K>) {
        const resolver = this.subjectResolvers[subject.type];
        if (!resolver) {
            throw new Error(`No resolver found for subject type ${subject.type}`);
        }

        const index = await this.store.getCurrentIndex();
        return resolver.getItem(index, resourceUrl, subject.selector)
    }

    async addPermission<K extends SubjectKey<T>>(resourceUrl: string, addedPermission: Permission, subject: SubjectType<T, K>) {
        const release = await this.acquire();
        try {
            let permissions = await this.getExistingPermissions(resourceUrl, subject);

            if (permissions.indexOf(addedPermission) !== -1) {
                console.error("Permission already granted")
                return permissions;
            }

            permissions.push(addedPermission)

            await this.updateItem(resourceUrl, subject, permissions)
            return permissions;
        } catch (e) {
            throw e;
        } finally {
            release();
        }
    }

    async removePermission<K extends SubjectKey<T>>(resourceUrl: string, removedPermission: Permission, subject: SubjectType<T, K>) {
        const release = await this.acquire();
        try {
            let oldPermissions = await this.getExistingPermissions(resourceUrl, subject);
            let newPermissions = oldPermissions.filter((p) => p !== removedPermission);

            if (newPermissions.length === oldPermissions.length) {
                console.error("Permission not found")
                return oldPermissions;
            }

            await this.updateItem(resourceUrl, subject, newPermissions)
            return newPermissions;
        } catch (e) {
            throw e;
        } finally {
            release();
        }
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

    // NOTE: Do the following functions need to use the cached index when possible?
    getContainerPermissionList(containerUrl: string): Promise<ResourcePermissions<T[keyof T]>[]> {
        return this.permissionManager.getContainerPermissionList(containerUrl);
    }

    getResourcePermissionList(resourceUrl: string) {
        return this.permissionManager.getRemotePermissions(resourceUrl);
    }
}
