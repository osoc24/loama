import {
  AccessModes,
  getSolidDataset,
  getThingAll
} from "@inrupt/solid-client";
import {
  getAgentAccessAll,
  getPublicAccess,
} from "@inrupt/solid-client/universal";
import { Session } from "@inrupt/solid-client-authn-browser";
import { Permission, ResourcePermissions, ResourcePermissionsNew } from "./types";
import { url } from "loama-common";

/**
 *
 * @param session An active Solid client connection
 * @param containerUrl URL to the container
 * @returns The access modes list per resource
 */
export async function getContainerResources(session: Session, containerUrl: url) {
  return await getResourcePermissionsList(session, containerUrl);
}

async function getResourcePermissionsList(
  session: Session,
  containerUrl: url
): Promise<ResourcePermissions[]> {
  const dataset = await getSolidDataset(containerUrl, { fetch: session.fetch });
  return Promise.all(
      getThingAll(dataset)
          .map(async (resource) => ({
              resourceUrl: resource.url,
              permissions: await getRemotePermissions(session, resource.url),
          }))
  );
}

/**
 * Gets the access modes for all the defined agents on a resource and for the public.
 * @param session An active Solid client connection
 * @param resourceUrl The URL to a resource
 * @returns The access modes with their agents
 */
export async function getRemotePermissions(
  session: Session,
  resourceUrl: url
): Promise<Record<url, Permission[]>> {
  // check remote
  // TODO this piece of code depends on WAC/ACP, should be a module
  const list = await Promise.all([
    getAgentAccessAll(resourceUrl, { fetch: session.fetch }) as Promise<
      Record<url, AccessModes>
    >,
    { public: await getPublicAccess(resourceUrl, { fetch: session.fetch })! } as Record<
      url,
      AccessModes
    >,
  ])
  const records = Object.assign({}, ...list);
  const remotePermissions = accessModesToPermissions(records);
  // check with index
  // TODO
  // update index where needed
  // TODO
  return remotePermissions;
}

function accessModesToPermissions(
  record: Record<url, AccessModes>
): Record<url, Permission[]> {
  const result: {
    [agent: string]: Permission[];
  } = {};
  // List -> Set -> List is done to filter out possible duplicate Permission.Control's
  const mapToPermission = (accessModes: [string, boolean][]) => [
    ...new Set(
      accessModes
        .map(([mode, isActive]) => {
          if (isActive) {
            switch (mode) {
              case "read":
                return Permission.Read;
              case "write":
                return Permission.Write;
              case "append":
                return Permission.Append;
              case "controlRead":
              case "controlWrite":
                return Permission.Control;
            }
          }
        })
        .filter((p) => p !== undefined)
    ),
  ];

  Object.entries(record).forEach(([agent, accessModes]) => {
    result[agent] = mapToPermission(Object.entries(accessModes));
  });

  return result;
}
