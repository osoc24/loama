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
  user: UserTypeObject | undefined,
  permissions: Permission[]
): Promise<Index> {
  const newItem: IndexItem = {
    id: crypto.randomUUID(),
    isEnabled: true,
    permissions: permissions,
    resources: resources,
    userType: user,
  };

  // NOTE: No checks are performed to see if the item isn't already present
  index.items.push(newItem);

  await updateACL(session, resources, user, permissions);
  await updateRemoteIndex(session, index);

  return index;
}

export async function removePermissions(
  session: Session,
  index: Index,
  itemId: string
): Promise<Index> {
  const itemIndex = index.items.findIndex(({ id }) => id === itemId);

  if (itemIndex === -1) {
    throw new Error("Element not found");
  }

  const item = index.items[itemIndex];

  await updateACL(
    session,
    item.resources,
    item.userType,
    item.permissions,
    true
  );

  index.items[itemIndex].isEnabled = false;

  await updateRemoteIndex(session, index);

  return index;
}

export async function editPermissions(
  session: Session,
  index: Index,
  itemId: string,
  permissions: Permission[]
) {
  const itemIndex = index.items.findIndex(({ id }) => id === itemId);

  if (itemIndex === -1) {
    throw new Error("Element not found");
  }

  const item = index.items[itemIndex];

  const oldPermissionsSet = new Set(item.permissions);
  const newPermissionsSet = new Set(item.permissions);
  const addedPermissions = newPermissionsSet.difference(oldPermissionsSet);
  const removedPermissions = oldPermissionsSet.difference(newPermissionsSet);

  await updateACL(session, item.resources, item.userType, [
    ...addedPermissions,
  ]);
  await updateACL(
    session,
    item.resources,
    item.userType,
    [...removedPermissions],
    true
  );

  index.items[itemIndex].permissions = permissions;

  await updateRemoteIndex(session, index);

  return index;
}

async function updateACL(
  session: Session,
  resources: url[],
  user: UserTypeObject | undefined,
  permissions: Permission[],
  removePermission?: boolean
) {
  return await Promise.all(
    resources.map(async (resource) => {
      if (user === undefined) {
        return await setPublicAccess(
          resource,
          permissionsToAccessModes(permissions, removePermission),
          { fetch: session.fetch }
        );
      } else {
        return await setAgentAccess(
          resource,
          user.url,
          permissionsToAccessModes(permissions, removePermission),
          {
            fetch: session.fetch,
          }
        );
      }
    })
  );
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
 *
 * @param removePermission Boolean to indicate if the permissions should be removed or not.
 */
function permissionsToAccessModes(
  permissions: Permission[],
  removePermission?: boolean
): Partial<AccessModes> {
  const accessModes: Partial<AccessModes> = {};
  // false: Remove the AccessMode
  const accessModeValue = !removePermission ?? true;

  for (const permission of permissions) {
    switch (permission) {
      case Permission.Append:
        accessModes.append = accessModeValue;
        break;
      case Permission.Control:
        accessModes.controlRead = accessModeValue;
        accessModes.controlWrite = accessModeValue;
      case Permission.Read:
        accessModes.read = accessModeValue;
        break;
      case Permission.Write:
        accessModes.write = accessModeValue;

        // Setting Write also enables Append, but removing Write doesn't remove Append
        if (accessModeValue === false) {
          accessModes.append = false;
        }

        break;
    }
  }

  return accessModes;
}
