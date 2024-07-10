import {
  getPodUrlAll,
  getPropertyAll,
  getSolidDataset,
  getThingAll,
  SolidDataset,
  Thing,
} from "@inrupt/solid-client";
import { Session } from "@inrupt/solid-client-authn-browser";

export async function listPods(
  session: Session
): Promise<{ pod: string; things: { url: string; properties: string[] }[] }[]> {
  const pods = await getPodUrlAll(session.info.webId!, {
    fetch: session.fetch,
  });
  return Promise.all(
    pods.map(async (url) => ({
      pod: url,
      things: await listThings(session, url),
    }))
  );
}

async function listThings(
  session: Session,
  url: string
): Promise<{ url: string; properties: string[] }[]> {
  const dataset = await getSolidDataset(url, { fetch: session.fetch });
  return getThingAll(dataset).map((t) => ({
    url: t.url,
    properties: getPropertyAll(t),
  }));
}
