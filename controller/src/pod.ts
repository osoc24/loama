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
import { FOAF } from "@inrupt/vocab-common-rdf";
import { Permission, url, Post, Appointment } from "./types";

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

  const name = getStringNoLocale(profileThing, FOAF.name) ?? "";
  const mbox = getUrl(profileThing, FOAF.mbox) ?? "";
  const description =
    getStringWithLocale(
      profileThing,
      "http://schema.org/description",
      "en-us"
    ) ?? "";
  const img = getUrl(profileThing, FOAF.img) ?? "";
  const phone = getUrl(profileThing, FOAF.phone) ?? "";

  return { name, mbox, description, img, phone };
}

/**
 * @param session An active Solid client connection
 * @param url URL to the user's pod
 * @returns get the users posts
 */
export async function getPosts(session: Session, url: url): Promise<Post[]> {
  const postsDataset = await getSolidDataset(`${url}/profile/posts/`, {
    fetch: session.fetch,
  });
  const resources = getContainedResourceUrlAll(postsDataset);

  const posts: Post[] = [];

  await Promise.all(
    resources.map(async (resource) => {
      const resourceDataset = await getSolidDataset(resource, {
        fetch: session.fetch,
      });
      const things = getThingAll(resourceDataset);
      posts.push(
        ...things.map((thing) => {
          const text = getStringNoLocale(thing, "https://schema.org/text");
          const video = getUrl(thing, "https://schema.org/video");
          const image = getUrl(thing, "https://schema.org/image");
          return { text, video, image };
        })
      );
    })
  );

  return posts;
}

/**
 * @param session An active Solid client connection
 * @param url URL to the user's pod
 * @returns the users appointments
 */
export async function getAppointments(
  session: Session,
  url: url
): Promise<Appointment[]> {
  const appointmentsDataset = await getSolidDataset(`${url}/appointments/`, {
    fetch: session.fetch,
  });
  const resources = getContainedResourceUrlAll(appointmentsDataset);

  const appointments: Appointment[] = [];

  await Promise.all(
    resources.map(async (resource) => {
      const resourceDataset = await getSolidDataset(resource, {
        fetch: session.fetch,
      });
      const things = getThingAll(resourceDataset);
      appointments.push(
        ...things.map((thing) => {
          const type =
            getStringNoLocale(thing, "https://schema.org/additionalType") ??
            null;
          const location =
            getStringNoLocale(thing, "https://schema.org/location") ?? null;
          const provider =
            getStringNoLocale(thing, "https://schema.org/provider") ?? null;
          const scheduledTime = getDatetime(
            thing,
            "https://schema.org/scheduledTime"
          );

          const date = scheduledTime
            ? new Date(scheduledTime).toLocaleDateString()
            : null;
          const time = scheduledTime
            ? new Date(scheduledTime).toLocaleTimeString()
            : null;

          return { type, location, provider, date, time };
        })
      );
    })
  );

  return appointments;
}
