import {
  AccessModes,
  getPodUrlAll,
  getPropertyAll,
  getSolidDataset,
  getThingAll,
} from "@inrupt/solid-client";
import {
  getAgentAccessAll,
  getPublicAccess,
} from "@inrupt/solid-client/universal";
import { Session } from "@inrupt/solid-client-authn-browser";
import { Permission, url } from "./types";

/**
 * List the pods that are from the currently authenticated user.
 * @param session An active Solid client connection
 * @returns The pods with their things listed
 */
export async function listPods(session: Session): Promise<
  {
    pod: url;
    things: {
      url: url;
      properties: url[];
      accessModes: Record<url, Permission[]>;
    }[];
  }[]
> {
  const pods = await getPodUrlAll(session.info.webId!, {
    fetch: session.fetch,
  });
  return Promise.all(pods.map(async (url) => listPod(session, url)));
}

export async function listPod(session: Session, url: url) {
  return { pod: url, things: await listThings(session, url) };
}

async function listThings(
  session: Session,
  url: url
): Promise<
  {
    url: url;
    properties: url[];
    accessModes: Record<url, Permission[]>;
  }[]
> {
  const dataset = await getSolidDataset(url, { fetch: session.fetch });
  return Promise.all(
    getThingAll(dataset).map(async (t) => ({
      url: t.url,
      properties: getPropertyAll(t),
      accessModes: await getAccessModes(session, t.url),
    }))
  );
}

/**
 * Gets the access modes for all the defined agents on a resource and for the public.
 * @param session An active Solid client connection
 * @param url The URL to a resource
 * @returns The access modes with their agents
 */
async function getAccessModes(
  session: Session,
  url: url
): Promise<Record<url, Permission[]>> {
  return Promise.all([
    getAgentAccessAll(url, { fetch: session.fetch }) as Promise<
      Record<string, AccessModes>
    >,
    { public: await getPublicAccess(url, { fetch: session.fetch })! } as Record<
      string,
      AccessModes
    >,
  ])
    .then((list) => Object.assign({}, ...list))
    .then((records) => accessModesToPermissions(records));
}

function accessModesToPermissions(
  record: Record<url, AccessModes>
): Record<url, Permission[]> {
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

  return Object.assign(
    Object.entries(record).map(([agent, accessModes]) => ({
      [agent]: mapToPermission(Object.entries(accessModes)),
    }))
  );
}
