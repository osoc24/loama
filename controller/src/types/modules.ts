import { BaseSubject, Index, IndexItem, Permission, ResourcePermissions } from "../types";

export type SubjectKey<T> = keyof T & string;
export type SubjectType<T, K extends SubjectKey<T>> = T[K];
export type EnforceKeyMatchResolver<T extends Record<string, BaseSubject<string>>> = {
    [K in keyof T]: T[K] extends BaseSubject<K & string> ? ISubjectResolver<T[K]> : never;
}

export interface IController<T extends Record<keyof T, BaseSubject<keyof T & string>>> {
    setPodUrl(podUrl: string): void;
    unsetPodUrl(podUrl: string): void;
    getLabelForSubject<K extends SubjectKey<T>>(subject: T[K]): string;
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
    /**
    * Retrieve the permissions of the resources in this container.
    * Will probably work for a resource, but not guaranteed. Use getItem for that
    */
    getContainerPermissionList(containerUrl: string): Promise<ResourcePermissions<T[keyof T]>[]>
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

export interface ISubjectResolver<T extends BaseSubject<string>> {
    /**
    *  @returns a human-readable label for the subject
    */
    toLabel(subject: T): string;
    checkMatch(subjectA: T, subjectB: T): boolean;
    /**
    * @returns a reference to index item for the given resource and subject
    */
    getItem(index: Index, resourceUrl: string, subjectSelector?: unknown): IndexItem | undefined
}

export interface IPermissionManager<T = Record<string, BaseSubject<string>>> {
    // Does not update the index file
    createPermissions<K extends SubjectKey<T>>(resource: string, subject: T[K], permissions: Permission[]): Promise<void>
    // Does not update the index file
    editPermissions<K extends SubjectKey<T>>(resource: string, item: IndexItem, subject: T[K], permissions: Permission[]): Promise<void>
    getRemotePermissions<K extends SubjectKey<T>>(resourceUrl: string): Promise<ResourcePermissions<T[K]>>
    /**
    * Retrieve the permissions of  e resources  i n th i s  container.
    * Will probably work for a resource, but not guaranteed. Use getRemotePermissions for that
    */
    getContainerPermissionList(containerUrl: string): Promise<ResourcePermissions<T[keyof T]>[]>
}
