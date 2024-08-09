import {
  AccessModes,
  FetchError,
  getFile,
  overwriteFile,
  saveFileInContainer,
} from "@inrupt/solid-client";
import { Session } from "@inrupt/solid-client-authn-browser";
import {
  Index,
  IndexItem,
  Permission,
  Type,
  Subject,
} from "./types";
import {
  setAgentAccess,
  setPublicAccess,
} from "@inrupt/solid-client/universal";
import { url } from "loama-common";

// TODO this should be a more resilient path: be.ugent.idlab.knows.solid.loama.index.js or smth
const indexPath = 'index.json';

/**
 * Get the index file for a given pod. If it can't be found create an empty one.
 */
export async function getOrCreateIndex(session: Session, podUrl: url): Promise<Index> {
  // async/await?
  const indexUrl = `${podUrl}${indexPath}`;
  return getFile(indexUrl, { fetch: session.fetch })
    .catch((error: FetchError) => {
      if (error.statusCode === 404) {
        return saveFileInContainer(
          podUrl,
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
export async function createPermissions(
  session: Session,
  index: Index,
  resource: url,
  subject: Subject | undefined,
  permissions: Permission[]
): Promise<Index> {
  const newItem: IndexItem = {
    id: crypto.randomUUID(),
    isEnabled: true,
    permissions: permissions,
    resource: resource,
    subject: subject,
  };

  // TODO check to see if the item isn't already present
  index.items.push(newItem);

  await updateACL(session, resource, subject, permissions);
  await updateRemoteIndex(session, index);

  return index;
}

// TODO currently not used
async function disablePermissions(
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
    item.resource,
    item.subject,
    undefined,
    item.permissions
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
  // 1. make diff with index to see what to create/update/delete, per resource
  const itemIndex = index.items.findIndex(({ id }) => id === itemId);
  if (itemIndex === -1) {
    throw new Error("Item is not found, is it present in the index file?");
  }
  const item = index.items[itemIndex];
  
  const oldPermissionsSet = new Set(item.permissions);
  const newPermissionsSet = new Set(permissions);
  const addedPermissions = newPermissionsSet.difference(oldPermissionsSet);
  const removedPermissions = oldPermissionsSet.difference(newPermissionsSet);
  
  // 2. update external auth
  await updateACL(session, item.resource, item.subject, [
    ...addedPermissions,
  ], [...removedPermissions]);

  // 3. check latest updated result
  // TODO should check online status
  
  // 4. update index
  index.items[itemIndex].permissions = permissions;
  await updateRemoteIndex(session, index);

  return index;
}

export function getItemId(index: Index, resource: url, subjectUrl: string) {
  if (subjectUrl === "public") {
    return index.items.find(
      (indexItem) =>
        indexItem.resource === resource &&
        indexItem.subject === undefined
    )?.id;
  }

  return index.items.find(
    (indexItem) =>
      indexItem.resource === resource &&
      indexItem.subject &&
      indexItem.subject.type === Type.WebID &&
      indexItem.subject.url === subjectUrl
  )?.id;
}

async function updateACL(
  session: Session,
  resource: url,
  subject: Subject | undefined,
  addedPermissions: Permission[] = [],
  removedPermissions: Permission[] = []
) {
  if (subject === undefined) {
    if (addedPermissions.length > 0) {
      await setPublicAccess(
        resource,
        permissionsToAccessModes(addedPermissions, false),
        { fetch: session.fetch }
      );
    }
    if (removedPermissions.length > 0) {
      await setPublicAccess(
        resource,
        permissionsToAccessModes(removedPermissions, true),
        { fetch: session.fetch }
      );
    }
  } else {
    if (addedPermissions.length > 0) {
      await setAgentAccess(
        resource,
        subject.url,
        permissionsToAccessModes(addedPermissions, false),
        {
          fetch: session.fetch,
        }
      );
    }
    if (removedPermissions.length > 0) {
      await setAgentAccess(
        resource,
        subject.url,
        permissionsToAccessModes(addedPermissions, true),
        {
          fetch: session.fetch,
        }
      );
    }
  }
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
  return new File([JSON.stringify(index)], indexPath, {
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
