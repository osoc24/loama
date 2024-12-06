import { url } from "loama-common";

/**
 * The json schema for the resources file which holds the shareable resources inside a Solid data pod.
 */
export interface Resources {
    id: url;
    items: string[]
}

/**
 * The json schema for the index configuration file inside a Solid data pod.
 */
export interface Index<T extends BaseSubject<string> = BaseSubject<string>> {
    id: url;
    items: IndexItem<T>[];
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
    subject: T;
    permissions: Permission[];
    isEnabled: boolean;
}

export interface ResourcePermissions<T = BaseSubject<string>> {
    resourceUrl: url;
    canRequestAccess: boolean;
    permissionsPerSubject: SubjectPermissions<T>[]
}

/**
  * The node structure used in the tree-structure for requestable resources
  */
export interface ResourceAccessRequestNode {
    resourceUrl: url;
    canRequestAccess: boolean;
    /**
    * A map of the next url part to the informationNode for select part
    * eg. example.com/a/b/c is a map of "a" with "b" in it's children map etc.
    */
    children?: Record<string, ResourceAccessRequestNode>;
}

export type AccessRequestMessage = {
    id: string;
    // The webid of the person performing the request
    actor: string;
    requestedAt: Date;
    target: string;
    permissions: string[];
}

export type RequestResponseMessage = {
    id: string;
    isAccepted: boolean;
    target: string;
    permissions: string[];
}
