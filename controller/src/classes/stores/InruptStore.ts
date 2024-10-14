import { FetchError, getFile, overwriteFile, saveFileInContainer, WithResourceInfo } from "@inrupt/solid-client";
import { IStore } from "../../types/modules";
import { BaseStore } from "./BaseStore";
import { getDefaultSession, Session } from "@inrupt/solid-client-authn-browser";

/**
 * A store implementation using the inrupt sdk to actually communicate with the pod
 * The "Inrupt" prefix is to indicate the usage of the inrupt sdk
 * This store can be used without the the InruptPermissionManager
*/
export class InruptStore<T> extends BaseStore<T> implements IStore<T> {
    private session: Session;
    private templateGenerator: () => T;

    // TODO this should be a more resilient path: be.ugent.idlab.knows.solid.loama.index.js or smth
    constructor(filePath: string, templateGenerator: () => T) {
        super(filePath)
        this.templateGenerator = templateGenerator;
        this.session = getDefaultSession()
    }

    private toJsonFile(data: unknown, path: string): File {
        return new File([JSON.stringify(data)], path, {
            type: "application/json",
        });
    }

    // NOTE: Possible will move the podUrl to the parameters, this works for the current POC
    async getOrCreate(): Promise<T> {
        if (!this.podUrl) {
            throw new Error("Cannot get current index file: pod location is not set");
        }

        if (this.data) {
            return this.data;
        }

        const dataUrl = `${this.podUrl}${this.filePath}`;
        let file: (Blob & WithResourceInfo) | undefined = undefined
        try {
            file = await getFile(dataUrl, { fetch: this.session.fetch })
        } catch (error: unknown) {
            if (error instanceof FetchError && error.statusCode === 404) {
                this.data = this.templateGenerator();
                file = await saveFileInContainer(
                    this.podUrl,
                    this.toJsonFile(this.data, this.filePath),
                    { fetch: this.session.fetch }
                );
            }
        }

        const fileText = await file?.text();
        this.data = JSON.parse(fileText ?? "{}");
        if (!this.data) {
            throw new Error(`Store data(${this.filePath}) not found or invalid`);
        }

        return this.data;
    }

    async saveToRemote() {
        if (!this.data) {
            await this.getOrCreate();
        }
        if (!this.data) {
            throw new Error(`Store data(${this.filePath}) not found or invalid`);
        }

        // NOTE: the fileUrl was stored in the file, do we want to enforce our generic to atleast have this id property available?
        overwriteFile(`${this.podUrl}${this.filePath}`, this.toJsonFile(this.data, this.filePath), {
            fetch: this.session.fetch,
        });
    }
}
