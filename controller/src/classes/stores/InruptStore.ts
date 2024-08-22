import { FetchError, getFile, overwriteFile, saveFileInContainer, WithResourceInfo } from "@inrupt/solid-client";
import { Index } from "../../types";
import { IStore } from "../../types/modules";
import { BaseStore } from "./BaseStore";
import { getDefaultSession, Session } from "@inrupt/solid-client-authn-browser";

export class InruptStore extends BaseStore implements IStore {
    // TODO this should be a more resilient path: be.ugent.idlab.knows.solid.loama.index.js or smth
    private indexPath = "index.json";
    private session: Session;

    constructor() {
        super()
        this.session = getDefaultSession()
    }

    private indexToIndexFile(): File {
        return new File([JSON.stringify(this.index)], this.indexPath, {
            type: "application/json",
        });
    }

    // NOTE: Possible will move the podUrl to the parameters, this works for the current POC
    async getOrCreateIndex(): Promise<Index> {
        if (!this.podUrl) {
            throw new Error("Cannot get current index file: pod location is not set");
        }

        const indexUrl = `${this.podUrl}${this.indexPath}`;
        let file: (Blob & WithResourceInfo) | undefined = undefined
        try {
            file = await getFile(indexUrl, { fetch: this.session.fetch })
        } catch (error: unknown) {
            if (error instanceof FetchError && error.statusCode === 404) {
                this.index = { id: indexUrl, items: [] }
                file = await saveFileInContainer(
                    this.podUrl,
                    this.indexToIndexFile(),
                    { fetch: this.session.fetch }
                );
            }
        }

        const fileText = await file?.text();
        this.index = JSON.parse(fileText ?? "{}");
        if (!this.index) {
            throw new Error("Index not found or invalid");
        }

        return this.index;
    }

    async saveToRemoteIndex() {
        if (!this.index) {
            await this.getOrCreateIndex();
        }
        if (!this.index) {
            throw new Error("Index not found or invalid");
        }

        overwriteFile(this.index.id, this.indexToIndexFile(), {
            fetch: this.session.fetch,
        });
    }
}
