import {
  AccessModes,
  FetchError,
  getFile,
  overwriteFile,
  saveFileInContainer,
} from "@inrupt/solid-client";
import { Session } from "@inrupt/solid-client-authn-browser";
import { Index, IndexItem, Permission, url, UserTypeObject } from "./types";
import {
  setAgentAccess,
  setPublicAccess,
} from "@inrupt/solid-client/universal";

/**
 * Get the index file for a given pod. If it can't be found create an empty one.
 */
export async function getOrCreateIndex(
  session: Session,
  pod: url
): Promise<Index> {
  const indexUrl = `${pod}index.json`;
  return getFile(indexUrl, { fetch: session.fetch })
    .catch((error: FetchError) => {
      if (error.statusCode === 404) {
        return saveFileInContainer(
          pod,
          indexToIndexFile({ id: indexUrl, items: [] } as Index),
          { fetch: session.fetch }
        );
      }
    })
    .then((res) => res?.text())
    .then((text) => JSON.parse(text ?? "{}"));
}

/**
 * NOTE: Currently, it doesn't do any recursive permission setting on containers
 *
 * Side effects:
 * - The remote ACL is updated
 * - The remote index file is synced
 */
export async function addPermissions(
  session: Session,
  index: Index,
  resources: url[],
  user: UserTypeObject,
  permissions: Permission[]
): Promise<Index> {
  const newItem: IndexItem = {
    isEnabled: true,
    permissions: permissions,
    resources: resources,
    userType: user,
  };

  // NOTE: No checks are performed to see if the item isn't already present
  index.items.push(newItem);

  // Update the ACL
  await Promise.all(
    resources.map(async (resource) => {
      if (typeof user === "boolean") {
        return await setPublicAccess(
          resource,
          permissionsToAccessModes(permissions),
          { fetch: session.fetch }
        );
      } else {
        return await setAgentAccess(
          resource,
          user.url,
          permissionsToAccessModes(permissions),
          {
            fetch: session.fetch,
          }
        );
      }
    })
  );

  await updateRemoteIndex(session, index);

  return index;
}

/**
 * Overwrite the index file in the pod with the given `index`.
 * This disregards any potential changes in the remote that aren't reflected here.
 */
async function updateRemoteIndex(session: Session, index: Index) {
  return overwriteFile(index.id, indexToIndexFile(index), {
    fetch: session.fetch,
  });
}

function indexToIndexFile(index: Index): File {
  return new File([JSON.stringify(index)], "index.json", {
    type: "application/json",
  });
}

/**
 * Maps the permission structure that the controller uses to the one from `@inrupt/solid-client`.
 */
function permissionsToAccessModes(
  permissions: Permission[]
): Partial<AccessModes> {
  const accessModes: Partial<AccessModes> = {};

  for (const permission of permissions) {
    switch (permission) {
      case Permission.Append:
        accessModes.append = true;
        break;
      case Permission.Control:
        accessModes.controlRead = true;
        accessModes.controlWrite = true;
      case Permission.Read:
        accessModes.read = true;
        break;
      case Permission.Write:
        accessModes.write = true;
        break;
    }
  }

  return accessModes;
}
