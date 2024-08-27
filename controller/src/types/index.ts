import { url } from "loama-common";

/**
 * The json schema for the index configuration file inside a Solid data pod.
 */
export interface Index {
    id: url;
    items: IndexItem[];
}

export interface IndexItem<T extends BaseSubject<string> = BaseSubject<string>> {
    id: string; // UUID
    requestId: string; // UUID
    isEnabled: boolean;
    permissions: Permission[];
    resource: string;
    subject: T;
}

export enum Permission {
    Append = "Append",
    Control = "Control",
    Read = "Read",
    Write = "Write",
}

export interface BaseSubject<T extends string> {
    type: T;
    selector?: {
        [key: string]: any;
    }
}

export interface SubjectPermissions<T = BaseSubject<string>> {
    subject: T,
    permissions: Permission[]
}

export interface ResourcePermissions<T = BaseSubject<string>> {
    resourceUrl: url;
    permissionsPerSubject: SubjectPermissions<T>[]
}
