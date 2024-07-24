import {
  AccessModes,
  getPodUrlAll,
  getPropertyAll,
  getSolidDataset,
  getThingAll,
  getThing,
  getStringNoLocale,
  getUrl,
  getContainedResourceUrlAll,
  getDatetime,
  getStringWithLocale,
} from "@inrupt/solid-client";
import {
  getAgentAccessAll,
  getPublicAccess,
} from "@inrupt/solid-client/universal";
import { Session } from "@inrupt/solid-client-authn-browser";
import { Permission, url, Post, Appointment, FormattedThing } from "./types";
import { Schema } from "./index";

/**
 * List the pods that are from the currently authenticated user.
 * @param session An active Solid client connection
 * @returns The URL's to the pods the user has access to
 */
export async function listPods(session: Session): Promise<url[]> {
  return await getPodUrlAll(session.info.webId!, {
    fetch: session.fetch,
  });
}

/**
 *
 * @param session An active Solid client connection
 * @param url URL to the user's pod
 * @returns The pod with the things inside
 */
export async function getPod(session: Session, url: url) {
  return { pod: url, things: await listThings(session, url) };
}

async function listThings(
  session: Session,
  url: url
): Promise<FormattedThing[]> {
  const dataset = await getSolidDataset(url, { fetch: session.fetch });
  return Promise.all(
    getThingAll(dataset)
      // For some reason the appointments container is utterly borked permissions-wise
      .filter((t) => !t.url.includes("appointments"))
      .map(async (t) => ({
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

/**
 * @param session An active Solid client connection
 * @param url URL to the user's pod
 * @returns the information about the user
 */
export async function getProfileInfo(
  session: Session,
  url: url
): Promise<{
  name: string;
  mbox: string;
  description: string;
  img: string;
  phone: string;
}> {
  const dataset = await getSolidDataset(`${url}/profile/card#me`, {
    fetch: session.fetch,
  });
  const profileThing = getThing(dataset, `${url}/profile/card#me`);

  if (!profileThing) {
    throw new Error("Profile information not found");
  }

  const name = getStringNoLocale(profileThing, Schema.name) ?? "";
  const mbox = getUrl(profileThing, Schema.mbox) ?? "";
  const description =
    getStringWithLocale(profileThing, Schema.description, "en-us") ?? "";
  const img = getUrl(profileThing, Schema.img) ?? "";
  const phone = getUrl(profileThing, Schema.phone) ?? "";

  return { name, mbox, description, img, phone };
}

/**
 * @param session An active Solid client connection
 * @param url URL to the user's pod
 * @param mapFunction Function to map Thing to required type
 * @returns The resources mapped to the required type
 */
async function fetchResources<T>(
  session: Session,
  url: string,
  mapFunction: (thing: any) => T
): Promise<T[]> {
  const dataset = await getSolidDataset(url, { fetch: session.fetch });
  const resources = getContainedResourceUrlAll(dataset);

  const result: T[] = [];

  await Promise.all(
    resources.map(async (resource) => {
      const resourceDataset = await getSolidDataset(resource, {
        fetch: session.fetch,
      });
      const things = getThingAll(resourceDataset);
      result.push(...things.map(mapFunction));
    })
  );

  return result;
}

/**
 * @param session An active Solid client connection
 * @param url URL to the user's pod
 * @returns Get the user's posts
 */
export async function getPosts(session: Session, url: string): Promise<Post[]> {
  const mapPost = (thing: any): Post => ({
    text: getStringNoLocale(thing, Schema.text) || "",
    video: getUrl(thing, Schema.video) || "",
    image: getUrl(thing, Schema.image) || "",
  });
  return fetchResources(session, `${url}/profile/posts/`, mapPost);
}

/**
 * @param session An active Solid client connection
 * @param url URL to the user's pod
 * @returns Get the user's appointments
 */
export async function getAppointments(
  session: Session,
  url: string
): Promise<Appointment[]> {
  const mapAppointment = (thing: any): Appointment => {
    const scheduledTime = getDatetime(thing, Schema.scheduledTime);
    return {
      type: getStringNoLocale(thing, Schema.additionalType) || "",
      location: getStringNoLocale(thing, Schema.location) || "",
      provider: getStringNoLocale(thing, Schema.provider) || "",
      date: scheduledTime ? new Date(scheduledTime).toLocaleDateString() : "",
      time: scheduledTime ? new Date(scheduledTime).toLocaleTimeString() : "",
    };
  };

  // As the appointments folder is borked, cooltoinments is used as a back-up.
  return fetchResources(session, `${url}/cooltoinments/`, mapAppointment);
}
