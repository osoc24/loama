import { BaseSubject, Index, IndexItem, Permission, ResourceAccessRequestNode, ResourcePermissions, Resources, SubjectPermissions } from "../types";

export type SubjectKey<T> = keyof T & string;
export type SubjectType<T, K extends SubjectKey<T>> = T[K];
export type EnforceKeyMatchResolver<T extends Record<string, BaseSubject<string>>> = {
    [K in keyof T]: T[K] extends BaseSubject<K & string> ? ISubjectResolver<T[K]> : never;
}
export type SubjectConfig<T extends Record<keyof T, BaseSubject<keyof T & string>>, B extends T[keyof T] = T[keyof T]> = { resolver: ISubjectResolver<B>, manager: IPermissionManager<T> };
export type SubjectConfigs<T extends Record<keyof T, BaseSubject<keyof T & string>>> = Record<keyof T, SubjectConfig<T, T[keyof T]>>;

export interface IController<T extends Record<keyof T, BaseSubject<keyof T & string>>> {
    setPodUrl(podUrl: string): void;
    unsetPodUrl(podUrl: string): void;
    AccessRequest(): IAccessRequest;
    getLabelForSubject<K extends SubjectKey<T>>(subject: T[K]): string;
    getOrCreateIndex(): Promise<Index>;
    getItem<K extends SubjectKey<T>>(resourceUrl: string, subject: SubjectType<T, K>): Promise<IndexItem<T[K]> | undefined>;
    addPermission<K extends SubjectKey<T>>(resourceUrl: string, addedPermission: Permission, subject: SubjectType<T, K>): Promise<Permission[]>
    removePermission<K extends SubjectKey<T>>(resourceUrl: string, addedPermission: Permission, subject: SubjectType<T, K>): Promise<Permission[]>
    /**
    * Enables a the permissions for an existing subject
    * @throws Error if the item does not exist for the given subject
    */
    enablePermissions<K extends SubjectKey<T>>(resource: string, subject: SubjectType<T, K>): Promise<void>
    disablePermissions<K extends SubjectKey<T>>(resource: string, subject: SubjectType<T, K>): Promise<void>
    removeSubject<K extends SubjectKey<T>>(resource: string, subject: SubjectType<T, K>): Promise<void>
    /**
    * Retrieve the permissions of the resources in this container.
    * Will probably work for a resource, but not guaranteed. Use getItem for that
    */
    getContainerPermissionList(containerUrl: string): Promise<ResourcePermissions<T[keyof T]>[]>

    getResourcePermissionList(resourceUrl: string): Promise<ResourcePermissions<T[keyof T]>>
}

export interface IAccessRequest {
    /**
    * Will return a tree structure starting from the containerUrl with the access requestable (container) resources
    */
    getRequestableResources(containerUrl: string): Promise<ResourceAccessRequestNode>
    canRequestAccessToResource(resourceUrl: string): Promise<boolean>
    allowAccessRequest(resourceUrl: string): Promise<void>
    disallowAccessRequest(resourceUrl: string): Promise<void>
}

export interface IStore<T> {
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
    * Returns the currently stored data or calls getOrCreate if the data is not set
    */
    getCurrent(): Promise<T>;

    /**
    * Tries to retrieve the stored file from the pod. If it doesn't exist, it creates an empty one.
    */
    getOrCreate(): Promise<T>;
    /**
    * Saves the data to the pod
    */
    saveToRemote(): Promise<void>;
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
    getItem(index: Index<T>, resourceUrl: string, subjectSelector?: unknown): IndexItem<T> | undefined
}

export interface IPermissionManager<T = Record<string, BaseSubject<string>>> {
    // Does not update the index file
    createPermissions<K extends SubjectKey<T>>(resource: string, subject: T[K], permissions: Permission[]): Promise<void>
    // Does not update the index file
    editPermissions<K extends SubjectKey<T>>(resource: string, item: IndexItem, subject: T[K], permissions: Permission[]): Promise<void>
    deletePermissions<K extends SubjectKey<T>>(resource: string, subject: T[K]): Promise<void>
    getRemotePermissions<K extends SubjectKey<T>>(resourceUrl: string): Promise<SubjectPermissions<T[K]>[]>
    /**
    * Retrieve the permissions of the resources in this container.
    * It will add the skipped resources to the returning object but without the permissions assignments.
    * As this is necessary to clean-up the index
    * Will probably work for a resource, but not guaranteed. Use getRemotePermissions for that
    */
    getContainerPermissionList(containerUrl: string, resourceToSkip?: string[]): Promise<ResourcePermissions<T[keyof T]>[]>
    /**
    * This indicates if the underlying SDK automatically removes the entry from the SDK if all permissions are revoked
    */
    shouldDeleteOnAllRevoked(): boolean
}
