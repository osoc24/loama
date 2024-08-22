import { BaseSubject, Index, IndexItem, Permission, ResourcePermissions } from "../types";

export type SubjectKey<T> = keyof T & string;
export type SubjectType<T, K extends SubjectKey<T>> = T[K];

export interface IAccessManagement<T extends Record<keyof T, BaseSubject<keyof T & string>>> {
    setPodUrl(podUrl: string): void;
    unsetPodUrl(podUrl: string): void;
    getOrCreateIndex(): Promise<Index>;
    getItem<K extends SubjectKey<T>>(resourceUrl: string, subject: SubjectType<T, K>): Promise<IndexItem | undefined>;
    addPermission<K extends SubjectKey<T>>(resourceUrl: string, addedPermission: Permission, subject: SubjectType<T, K>): Promise<Permission[]>
    removePermission<K extends SubjectKey<T>>(resourceUrl: string, addedPermission: Permission, subject: SubjectType<T, K>): Promise<Permission[]>
    /**
    * Enables a the permissions for an existing subject
    * @throws Error if the item does not exist for the given subject
    */
    enablePermissions<K extends SubjectKey<T>>(resource: string, subject: SubjectType<T, K>): Promise<void>
    disablePermissions<K extends SubjectKey<T>>(resource: string, subject: SubjectType<T, K>): Promise<void>
}

export interface IAccessManagementBuilder<AllSubjectTypes extends Record<string, BaseSubject<keyof AllSubjectTypes & string>>> {
    setStore(store: IStore): IAccessManagementBuilder<AllSubjectTypes>;
    addSubjectResolver<SubjectType extends keyof AllSubjectTypes & string>(subjectType: SubjectType, subjectResolver: ISubjectResolver<SubjectType>): IAccessManagementBuilder<AllSubjectTypes & { [key in SubjectType]: BaseSubject<SubjectType> }>;
    setPermissionManager(permissionManager: IPermissionManager<BaseSubject<string>>): IAccessManagementBuilder<AllSubjectTypes>;
    build(): IAccessManagement<AllSubjectTypes>;
}

export interface IStore {
    /**
    * Implemented by BaseStore
    * Will set the protected pod url property
    */
    setPodUrl(url: string): void;
    /**
    * Removes the pod url property value
    */
    unsetPodUrl(): void;
    /**
    * Returns the currently stored index or calls getOrCreateIndex if the index is not set
    */
    getCurrentIndex(): Promise<Index>;

    /**
    * Tries to retrieve the stored index.json from the pod. If it doesn't exist, it creates an empty one.
    */
    getOrCreateIndex(): Promise<Index>;
    /**
    * Saves the index to the pod
    */
    saveToRemoteIndex(): Promise<void>;
}

export interface ISubjectResolver<K extends string, T extends BaseSubject<K> = BaseSubject<K>> {
    checkMatch(subjectA: T, subjectB: T): boolean;
    /**
    * @returns a reference to index item for the given resource and subject
    */
    getItem(index: Index, resourceUrl: string, subjectSelector?: unknown): IndexItem | undefined
}

export interface IPermissionManager<T extends BaseSubject<string>> {
    // Does not update the index file
    createPermissions(resource: string, subject: T, permissions: Permission[]): Promise<void>
    // Does not update the index file
    editPermissions(resource: string, item: IndexItem, subject: T, permissions: Permission[]): Promise<void>
    getRemotePermissions(resourceUrl: string): Promise<ResourcePermissions<T>>
}
