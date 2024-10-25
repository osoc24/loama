import { IStore } from "@/types/modules";
import { createContainerAt, FetchError, getResourceInfo, isContainer } from "@inrupt/solid-client";
import { BaseStore } from "./BaseStore";
import { getDefaultSession, Session } from "@inrupt/solid-client-authn-browser";

// A modified store which does not retrieve the data from the server and only does append actions
export class InruptInboxStore<M, T extends M[] = M[]> extends BaseStore<T> implements IStore<T> {
    protected session: Session;

    constructor(filePath: string) {
        super(filePath);
        this.session = getDefaultSession()
    }

    override async getOrCreate(): Promise<T> {
        try {
            let inboxResourceInfo = await getResourceInfo(this.getDataUrl(), { fetch: this.session.fetch });
            if (!isContainer(inboxResourceInfo)) {
                throw new Error("Inbox is not a container");
            }
        } catch (error: unknown) {
            // TODO: check if we can add a new inbox link to the loama container in a more generic way
            if (error instanceof FetchError && error.statusCode === 404) {
                await createContainerAt(this.getDataUrl(), { fetch: this.session.fetch });
            }
            if (error instanceof Error && error.message === "Inbox is not a container") {
                await createContainerAt(this.getDataUrl(), { fetch: this.session.fetch });
            }
            console.error(error);
        } finally {
            return this.data ??= [] as unknown as T;
        }
    }

    async saveToRemote() {
        if (!this.data) {
            await this.getOrCreate();
        }
        if (!this.data) {
            throw new Error(`Store data(${this.filePath}) not found or invalid`);
        }

        // Write each message to a new file in the inbox
        for (let msg of this.data) {
            await fetch(this.getDataUrl(), {
                method: "POST",
                headers: {
                    "Content-Type": 'application/ld+json;profile="https://www.w3.org/ns/activitystreams"'
                },
                body: JSON.stringify(msg)
            })
        }

        this.data = [] as unknown as T
    }
}
