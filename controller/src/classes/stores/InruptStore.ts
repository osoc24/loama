import { FetchError, getFile, overwriteFile, saveFileInContainer, WithResourceInfo } from "@inrupt/solid-client";
import { BaseSubject, Index, Resources } from "../../types";
import { IStore } from "../../types/modules";
import { BaseStore } from "./BaseStore";
import { getDefaultSession, Session } from "@inrupt/solid-client-authn-browser";
import { setPublicAccess } from "@inrupt/solid-client/universal";

/**
 * A store implementation using the inrupt sdk to actually communicate with the pod
 * The "Inrupt" prefix is to indicate the usage of the inrupt sdk
 * This store can be used without the the InruptPermissionManager
*/
export class InruptStore<T extends Record<keyof T, BaseSubject<keyof T & string>>> extends BaseStore<T> implements IStore<T> {
    // TODO this should be a more resilient path: be.ugent.idlab.knows.solid.loama.index.js or smth
    private indexPath = "index.json";
    private resourcesPath = "resources.json";
    private session: Session;

    constructor() {
        super()
        this.session = getDefaultSession()
    }

    private toJsonFile(data: unknown, path: string): File {
        return new File([JSON.stringify(data)], path, {
            type: "application/json",
        });
    }

    async getOrCreateResources(): Promise<Resources> {
        if (!this.podUrl) {
            throw new Error("Cannot get current resources file: pod location is not set");
        }

        if (this.resources) {
            return this.resources;
        }

        const resourcesPath = `${this.podUrl}${this.resourcesPath}`;
        let file: (Blob & WithResourceInfo) | undefined = undefined
        try {
            file = await getFile(resourcesPath, { fetch: this.session.fetch })
        } catch (error: unknown) {
            if (error instanceof FetchError && error.statusCode === 404) {
                this.resources = { id: resourcesPath, items: [] }
                file = await saveFileInContainer(
                    this.podUrl,
                    this.toJsonFile(this.resources, this.resourcesPath),
                    { fetch: this.session.fetch }
                );
                await setPublicAccess(resourcesPath, { read: true }, { fetch: this.session.fetch });
            }
        }

        const fileText = await file?.text();
        this.resources = JSON.parse(fileText ?? "{}");
        if (!this.resources) {
            throw new Error("Resources not found or invalid");
        }

        return this.resources;
    }

    // NOTE: Possible will move the podUrl to the parameters, this works for the current POC
    async getOrCreateIndex(): Promise<Index<T[keyof T]>> {
        if (!this.podUrl) {
            throw new Error("Cannot get current index file: pod location is not set");
        }

        if (this.index) {
            return this.index;
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
                    this.toJsonFile(this.index, this.indexPath),
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

        overwriteFile(this.index.id, this.toJsonFile(this.index, this.indexPath), {
            fetch: this.session.fetch,
        });
    }

    async saveToRemoteResources() {
        if (!this.resources) {
            await this.getOrCreateResources();
        }
        if (!this.resources) {
            throw new Error("Resources not found or invalid");
        }

        overwriteFile(this.resources.id, this.toJsonFile(this.resources, this.resourcesPath), {
            fetch: this.session.fetch,
        });
    }
}
