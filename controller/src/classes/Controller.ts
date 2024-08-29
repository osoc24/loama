import { BaseSubject, IndexItem, Permission, ResourcePermissions, SubjectPermissions } from "../types";
import { IController, IStore, SubjectConfig, SubjectConfigs, SubjectKey, SubjectType } from "../types/modules";
import { Mutex } from "./utils/Mutex";

export class Controller<T extends Record<keyof T, BaseSubject<keyof T & string>>> extends Mutex implements IController<T> {
    private store: IStore<T>
    private subjectConfigs: SubjectConfigs<T>

    constructor(store: IStore<T>, subjects: SubjectConfigs<T>) {
        super();
        this.store = store;
        this.subjectConfigs = subjects;
    }

    private getSubjectConfig<K extends SubjectKey<T>>(subject: T[K]): SubjectConfig<T, T[K]> {
        const subjectConfig = this.subjectConfigs[subject.type];
        if (!subjectConfig) {
            throw new Error(`No config found for subject type ${subject.type}`);
        }
        return subjectConfig as SubjectConfig<T, T[K]>
    }

    private async getExistingPermissions<K extends SubjectKey<T>>(resourceUrl: string, subject: T[K]): Promise<Permission[]> {
        const item = await this.getItem(resourceUrl, subject);
        if (item) {
            // Makeing sure the array is not a reference to the one stored in the index
            return [...item.permissions]
        }
        const subjectConfig = this.getSubjectConfig(subject)

        const subjects = await subjectConfig.manager.getRemotePermissions<K>(resourceUrl);
        const subjectPermission = subjects.find(entry => subjectConfig.resolver.checkMatch(entry.subject, subject))

        return [...subjectPermission?.permissions ?? []]
    }

    private async updateItem<K extends SubjectKey<T>>(resourceUrl: string, subject: SubjectType<T, K>, permissions: Permission[]) {
        let item = await this.getItem(resourceUrl, subject);
        const { manager } = this.getSubjectConfig(subject)

        if (item) {
            await manager.editPermissions(resourceUrl, item, subject, permissions);
        } else {
            await manager.createPermissions(resourceUrl, subject, permissions);

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

        if (permissions.length === 0 && manager.shouldDeleteOnAllRevoked()) {
            const index = await this.store.getCurrentIndex();
            const idx = index.items.findIndex(i => i.id === item.id);
            index.items.splice(idx, 1);
        } else {
            item.permissions = permissions;
        }

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
        const { resolver } = this.getSubjectConfig(subject);
        return resolver.toLabel(subject);
    }

    async getItem<K extends SubjectKey<T>>(resourceUrl: string, subject: SubjectType<T, K>): Promise<IndexItem<T[K]> | undefined> {
        const { resolver } = this.getSubjectConfig<K>(subject);

        const index = await this.store.getCurrentIndex<K>();
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
    async getContainerPermissionList(containerUrl: string): Promise<ResourcePermissions<T[keyof T]>[]> {
        // Need to put it in a variable because the type declaration vanishes
        const configs: SubjectConfig<T>[] = Object.values(this.subjectConfigs);
        const results = await Promise.allSettled(configs.map(c => c.manager.getContainerPermissionList(containerUrl)))

        return results.reduce<ResourcePermissions<T[keyof T]>[]>((arr, v) => {
            if (v.status === "fulfilled") {
                // Check if the resourceUrl is already present before pushing it into the array
                v.value.forEach((resource) => {
                    let existingInfo = arr.find((info) => info.resourceUrl === resource.resourceUrl);
                    if (existingInfo) {
                        existingInfo.permissionsPerSubject.push(...resource.permissionsPerSubject)
                    } else {
                        arr.push(resource)
                    }
                })
            }
            return arr;
        }, [])
    }

    async getResourcePermissionList(resourceUrl: string) {
        // Need to put it in a variable because the type declaration vanishes
        const configs: SubjectConfig<T>[] = Object.values(this.subjectConfigs);
        const results = await Promise.allSettled(configs.map(c => c.manager.getRemotePermissions(resourceUrl)))

        return {
            resourceUrl,
            permissionsPerSubject: results.reduce<SubjectPermissions<T[keyof T]>[]>((arr, v) => {
                if (v.status === "fulfilled") {
                    arr.push(...v.value)
                }
                return arr;
            }, [])
        }
    }
}
