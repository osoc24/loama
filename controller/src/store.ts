import { Session } from "@inrupt/solid-client-authn-browser";
import { Index, Type } from "./types";
import { FetchError, getFile, overwriteFile, saveFileInContainer, WithResourceInfo } from "@inrupt/solid-client";

// TODO this should be a more resilient path: be.ugent.idlab.knows.solid.loama.index.js or smth
const indexPath = 'index.json';
let currentPodUrl: string | undefined = undefined;
let currentIndex: Index | undefined = undefined;

export function setPodUrl(podUrl: string) {
    currentPodUrl = podUrl;
}

export function unsetPodUrl() {
    currentPodUrl = undefined;
}

export async function getCurrentIndex(session: Session) {
    if (!currentIndex) {
        if (!currentPodUrl) {
            throw new Error('Cannot get current index file: is the user logged in?')
        }
        currentIndex = await getOrCreateIndex(session, currentPodUrl);
    }
    return currentIndex;
}

export function getItem(index: Index, resource: string, subjectUrl: string) {
    if (subjectUrl === "public") {
        return index.items.find(
            (indexItem) =>
                indexItem.resource === resource &&
                indexItem.subject === undefined
        );
    }

    return index.items.find(
        (indexItem) =>
            indexItem.resource === resource &&
            indexItem.subject &&
            indexItem.subject.type === Type.WebID &&
            indexItem.subject.selector &&
            indexItem.subject.selector.url === subjectUrl
    );
}

/**
 * Get the index file for a given pod. If it can't be found create an empty one.
 */
export async function getOrCreateIndex(session: Session, podUrl: string): Promise<Index> {
    const indexUrl = `${podUrl}${indexPath}`;
    let file: (Blob & WithResourceInfo) | undefined = undefined
    try {
        file = await getFile(indexUrl, { fetch: session.fetch })
    } catch (error: unknown) {
        if (error instanceof FetchError && error.statusCode === 404) {
            file = await saveFileInContainer(
                podUrl,
                indexToIndexFile({ id: indexUrl, items: [] } as Index),
                { fetch: session.fetch }
            );
        }
    }
    const fileText = await file?.text();
    return JSON.parse(fileText ?? "{}");
}


/**
 * Overwrite the index file in the pod with the given `index`.
 * This disregards any potential changes in the remote that aren't reflected here.
 */
export async function updateRemoteIndex(session: Session, index: Index) {
    return overwriteFile(index.id, indexToIndexFile(index), {
        fetch: session.fetch,
    });
}

export function indexToIndexFile(index: Index): File {
    return new File([JSON.stringify(index)], indexPath, {
        type: "application/json",
    });
}

