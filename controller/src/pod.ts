import { getPodUrlAll } from "@inrupt/solid-client";
import { Session } from "@inrupt/solid-client-authn-browser";

export async function listPods(session: Session) {
  return getPodUrlAll(session.info.webId!, { fetch: session.fetch });
}
