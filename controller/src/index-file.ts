import {
  getFile,
  overwriteFile,
  saveFileInContainer,
} from "@inrupt/solid-client";
import { Session } from "@inrupt/solid-client-authn-browser";

export async function getIndexFile(session: Session, pod: string) {
  return getFile(`${pod}index.json`, { fetch: session.fetch })
    .catch((error) => {
      if (
        error ===
        'Error: Fetching the File failed: [404] [] {"name":"NotFoundHttpError","message":"","statusCode":404,"errorCode":"H404","details":{}}.'
      ) {
        return saveFileInContainer(
          pod,
          new File(["[]"], "index.json", { type: "application/json" }),
          { fetch: session.fetch }
        );
      }
    })
    .then((res) => res?.text())
    .then((text) => JSON.parse(text ?? ""));
}
