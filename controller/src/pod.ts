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

export async function listPods(session: Session): Promise<
  {
    pod: string;
    things: {
      url: string;
      properties: string[];
      accessModes: Record<string, AccessModes>;
    }[];
  }[]
> {
  const pods = await getPodUrlAll(session.info.webId!, {
    fetch: session.fetch,
  });
  return Promise.all(pods.map(async (url) => listPod(session, url)));
}

export async function listPod(session: Session, url: string) {
  return { pod: url, things: await listThings(session, url) };
}

async function listThings(
  session: Session,
  url: string
): Promise<
  {
    url: string;
    properties: string[];
    accessModes: Record<string, AccessModes>;
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

async function getAccessModes(
  session: Session,
  url: string
): Promise<Record<string, AccessModes>> {
  return Promise.all([
    getAgentAccessAll(url, { fetch: session.fetch }) as Promise<
      Record<string, AccessModes>
    >,
    { public: await getPublicAccess(url, { fetch: session.fetch })! } as Record<
      string,
      AccessModes
    >,
  ]).then((list) => Object.assign({}, ...list));
}
