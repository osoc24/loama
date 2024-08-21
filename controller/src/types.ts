import { url } from "loama-common";

/**
 * The json schema for the index configuration file inside a Solid data pod.
 * Generated from `schema.json`.
 */

export interface Index {
    id: url;
    items: IndexItem[];
}

// NOTE: Take another look at the K generic, Will be a pity if we just use "string" here
export interface IndexItem<K extends string = string, T extends BaseSubject<K> = BaseSubject<K>> {
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

export interface PublicSubject {
    type: "public";
}

export interface UrlSubject<T = "webId" | "group"> {
    type: T;
    selector: {
        url: string;
    }
}

export type WebIdSubject = UrlSubject<"webId">;

// NOTE: Same note about K as above
export interface ResourcePermissions<T extends BaseSubject<string>> {
    resourceUrl: url;
    permissionsPerSubject: {
        subject: T,
        permissions: Permission[]
    }[]
}
