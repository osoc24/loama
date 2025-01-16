import { FetchError, getFile, overwriteFile } from "@inrupt/solid-client";
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

    async getOrCreate(): Promise<T> {
        if (!this.podUrl) {
            throw new Error("Cannot get current index file: pod location is not set");
        }

        if (this.data) {
            return this.data;
        }

        try {
            let file = await getFile(this.getDataUrl(), { fetch: this.session.fetch })
            const fileText = await file?.text();
            this.data = JSON.parse(fileText ?? "{}");
        } catch (error: unknown) {
            if (error instanceof FetchError && error.statusCode === 404) {
                this.data = this.templateGenerator();
                this.saveToRemote();
            }
        }

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
        overwriteFile(this.getDataUrl(), this.toJsonFile(this.data, this.filePath), {
            fetch: this.session.fetch,
        });
    }
}
