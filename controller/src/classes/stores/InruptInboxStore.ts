import { IInbox } from "@/types/modules";
import { createContainerAt, FetchError, getContainedResourceUrlAll, getDatetime, getResourceInfo, getSolidDataset, getStringNoLocale, getThingAll, getUrl, isContainer } from "@inrupt/solid-client";
import { BaseStore } from "./BaseStore";
import { getDefaultSession, Session } from "@inrupt/solid-client-authn-browser";

// A modified store which does not retrieve the data from the server and only does append actions
export class InruptInboxStore<M> extends BaseStore<M[]> implements IInbox<M> {
    protected session: Session;

    constructor(filePath: string) {
        super(filePath);
        this.session = getDefaultSession()
    }

    override async getOrCreate() {
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
            return this.data ??= [] as unknown as M[];
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

        this.data = [] as unknown as M[]
    }

    async getMessages() {
        const inboxDataSet = await getSolidDataset(this.getDataUrl(), { fetch: this.session.fetch });
        const messageUrls = getContainedResourceUrlAll(inboxDataSet);
        const messages: unknown[] = [];
        for (let url of messageUrls) {
            const message = await getSolidDataset(url, { fetch: this.session.fetch });
            const allThings = getThingAll(message)
            const appendRequest = allThings.filter(t => t.predicates["http://www.w3.org/1999/02/22-rdf-syntax-ns#type"].namedNodes?.includes("tbd:AppendRequest"))?.[0];

            // This message does not contain a tbd:AppendRequest
            if (!appendRequest) {
                continue
            }

            const authorizationUrl = getUrl(appendRequest, "as:object");
            if (!authorizationUrl) {
                throw new Error(`Message with id ${url} does has no reference to an authorization object`);
            }

            const authorizationThing = allThings.filter(t => t.url === authorizationUrl)?.[0];
            if (!authorizationThing) {
                throw new Error(`Message with id ${url} does not contain the referenced authorization object`);
            }

            const entry = {
                id: appendRequest.url,
                actor: getStringNoLocale(appendRequest, "as:actor"),
                requestedAt: getDatetime(appendRequest, "as:published"),
                target: getStringNoLocale(authorizationThing, "acl:accessTo"),
                permissions: authorizationThing.predicates["acl:mode"].namedNodes,
            }
            messages.push(entry);
        }
        return messages;
    }
}
