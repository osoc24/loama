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
  resources: string[];
  // `undefined` means that this item applies for the public access
  userType?: UserTypeObject;
  [property: string]: any;
}

export enum Permission {
  Append = "Append",
  Control = "Control",
  Read = "Read",
  Write = "Write",
}

export interface UserTypeObject {
  name?: string;
  type: Type;
  url: string;
  [property: string]: any;
}

export enum Type {
  Group = "Group",
  WebID = "WebId",
}

export type url = string;

export interface FormattedThing {
  url: url;
  properties: url[];
  accessModes: Record<url, Permission[]>;
}
[];

export interface Post {
  text: string;
  video?: string;
  image?: string;
}

export interface Appointment {
  type?: string;
  location?: string;
  provider?: string;
  date?: string;
  time?: string;
}
