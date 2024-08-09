import { url } from "loama-common";

/**
 * The json schema for the index configuration file inside a Solid data pod.
 * Generated from `schema.json`.
 */

export interface Index {
  id: url;
  items: IndexItem[];
}

export interface IndexItem {
  id: string;
  isEnabled: boolean;
  permissions: Permission[];
  resource: string;
  // `undefined` means that this item applies for the public access
  subject?: Subject;
  [property: string]: any;
}

export enum Permission {
  Append = "Append",
  Control = "Control",
  Read = "Read",
  Write = "Write",
}

export interface Subject {
  name?: string;
  type: Type;
  url: string;
  [property: string]: any;
}

export enum Type {
  Group = "Group",
  WebID = "WebId",
}

export interface ResourcePermissions {
  resourceUrl: url;
  permissions: Record<url, Permission[]>; // webid -> permissions
}

// TODO replace above with below
export interface ResourcePermissionsNew {
  resourceUrl: url;
  permissionsPerSubject: {
    subject: {
      type: Type,
      selector?: {
        url?: url // will be extended depending on more Types, now webIds or groupUrls
      }
    },
    permissions: Permission[]
  }[]
}
