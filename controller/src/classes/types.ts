import { BaseSubject, Index, IndexItem, Permission, ResourcePermissions } from "../types";

export interface IAccessManagement {
    setPodUrl(podUrl: string): void;
    unsetPodUrl(podUrl: string): void;
    getOrCreateIndex(): Promise<Index>;
    getItem<T extends BaseSubject>(resourceUrl: string, subject: T): Promise<IndexItem | undefined>;
    addPermission<T extends BaseSubject>(resourceUrl: string, addedPermission: Permission, subject: T): Promise<Permission[]>
    removePermission<T extends BaseSubject>(resourceUrl: string, addedPermission: Permission, subject: T): Promise<Permission[]>
    enablePermissions<T extends BaseSubject>(resource: string, subject: T): Promise<void>
    disablePermissions<T extends BaseSubject>(resource: string, subject: T): Promise<void>
}

export interface IAccessManagementBuilder {
    setStore(store: IStore): IAccessManagementBuilder;
    addSubjectResolver(subjectType: string, subjectResolver: ISubjectResolver<BaseSubject>): IAccessManagementBuilder;
    setPermissionManager(permissionManager: IPermissionManager): IAccessManagementBuilder;
    build(): IAccessManagement;
}

export interface IStore {
    // Implemented by BaseStore
    // Will set the protected pod url property
    setPodUrl(url: string): void;
    // Removes the pod url property value
    unsetPodUrl(): void;
    // Returns the currently stored index or calls getOrCreateIndex if the index is not set
    getCurrentIndex(): Promise<Index>;

    // Tries to retrieve the stored index.json from the pod. If it doesn't exist, it creates an empty one.
    getOrCreateIndex(): Promise<Index>;
    // Saves the index to the pod
    saveToRemoteIndex(): Promise<void>;
}

export interface ISubjectResolver<T extends BaseSubject> {
    checkMatch(subjectA: T, subjectB: T): boolean;
    getItem(index: Index, resourceUrl: string, subjectSelector?: unknown): IndexItem | undefined
}

export interface IPermissionManager {
    // Does not update the index file
    createPermissions<T extends BaseSubject>(resource: string, subject: T, permissions: Permission[]): Promise<void>
    // Does not update the index file
    editPermissions<T extends BaseSubject>(resource: string, subject: T, permissions: Permission[]): Promise<void>
    getRemotePermissions<T extends BaseSubject>(resourceUrl: string): Promise<ResourcePermissions<T>>
}
