import { url } from "loama-common";

/**
 * The json schema for the index configuration file inside a Solid data pod.
 * Generated from `schema.json`.
 */

export interface Index {
    id: url;
    items: IndexItem[];
}

export interface IndexItem<T extends BaseSubject = BaseSubject> {
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

export interface BaseSubject {
    type: string;
    selector?: {
        [key: string]: any;
    }
}

export interface PublicSubject {
    type: "public"
}

export interface UrlSubject {
    type: Type;
    selector: {
        url: string;
    }
}

export enum Type {
    Group = "Group",
    WebID = "WebId",
}

export interface ResourcePermissions<T extends BaseSubject = (UrlSubject | PublicSubject)> {
    resourceUrl: url;
    permissionsPerSubject: {
        subject: T,
        permissions: Permission[]
    }[]
}
