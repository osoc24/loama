import { getDatetime, getLinkedResourceUrlAll, getResourceInfo, getStringNoLocale, getStringNoLocaleAll, getThingAll, getUrl } from "@inrupt/solid-client";
import { AccessRequestMessage, Permission, RequestResponseMessage, ResourceAccessRequestNode, Resources } from "../../types";
import { IAccessRequest, IController, IInbox, IInboxConstructor, IStore } from "../../types/modules";
import { cacheBustedFetch } from "../../util";
import { PermissionToACL } from "../utils/Permissions";

const REQUEST_RESPONSE_TYPES = ["as:Accept", "as:Reject"]

export abstract class AccessRequest implements IAccessRequest {
    private resources: IStore<Resources>;
    private inbox: IInbox<unknown>;
    private controller: IController<{}>;

    constructor(controller: IController<{}>, inboxConstructor: IInboxConstructor, resourcesStore: IStore<Resources>) {
        this.controller = controller;
        this.resources = resourcesStore;
        this.inbox = new inboxConstructor("public/loama/inbox/") as IInbox<unknown>;
    }

    async setPodUrl(url: string) {
        this.inbox.setPodUrl(url)
        // This will make sure we have the inbox & resources.json created in our own container
        await this.inbox.getOrCreate();
        await this.resources.getOrCreate();

        const publicController = this.controller.isSubjectSupported({ type: "public" });

        // Set permissions for info resources
        await publicController.addPermission(this.resources.getDataUrl(), Permission.Read, { type: "public" });
        await publicController.addPermission(this.inbox.getDataUrl(), Permission.Append, { type: "public" });
    }

    unsetPodUrl() {
        this.inbox.unsetPodUrl();
    }

    async getRequestableResources(containerUrl: string) {
        const requestableResources = await this.resources.getCurrent();
        const filteredRequestableResources = requestableResources.items.filter(item => item.startsWith(containerUrl) && item !== containerUrl);
        let masterNode: ResourceAccessRequestNode = {
            resourceUrl: containerUrl,
            canRequestAccess: requestableResources.items.includes(containerUrl),
            children: {},
        };

        filteredRequestableResources.forEach(resource => {
            const pathParts = resource.replace(containerUrl, "").split('/');
            pathParts.reduce(function(parentNode, pathPart, index) {
                if (pathPart == "") {
                    // Requestable is a directory, which ends in "/"
                    parentNode.resourceUrl += "/";
                    parentNode.canRequestAccess = true;
                    return parentNode;
                }
                if (!parentNode.children) {
                    parentNode.children = {};
                }
                if (parentNode.children[pathPart]) {
                    parentNode.children[pathPart].canRequestAccess = pathParts.length === index;
                }
                return parentNode.children[pathPart] || (parentNode.children[pathPart] = {
                    resourceUrl: `${parentNode.resourceUrl}${parentNode.resourceUrl.endsWith("/") ? "" : "/"}${pathPart}`,
                    canRequestAccess: (pathParts.length - 1) === index,
                    children: {},
                });
            }, masterNode)
        })

        return masterNode;
    }

    async canRequestAccessToResource(resourceUrl: string) {
        const resources = await this.resources.getCurrent();
        return resources.items.includes(resourceUrl);
    }

    async allowAccessRequest(resourceUrl: string) {
        const resources = await this.resources.getCurrent();
        if (resources.items.includes(resourceUrl)) {
            return;
        }
        resources.items.push(resourceUrl);

        await this.resources.saveToRemote();
    }

    async disallowAccessRequest(resourceUrl: string) {
        const resources = await this.resources.getCurrent();
        if (!resources.items.includes(resourceUrl)) {
            return;
        }
        const idx = resources.items.indexOf(resourceUrl);
        resources.items.splice(idx, 1);

        await this.resources.saveToRemote();
    }

    async sendRequestNotification(originWebId: string, resources: string[], permissions: Permission[]) {
        const requestableResources = await this.resources.getCurrent();
        const filteredResources = resources.filter(r => requestableResources.items.includes(r));

        const messages: unknown[] = [];
        for (let r of filteredResources) {
            // TODO: Replace with our own calls instead of using the inrupt SDK
            const resourceInfo = await getResourceInfo(r, {
                ignoreAuthenticationErrors: true,
                fetch: cacheBustedFetch
            });
            const linkedResources = getLinkedResourceUrlAll(resourceInfo)
            let acl = linkedResources.acl?.[0];
            if (!acl) {
                console.warn(`No acl found for ${r}, using ${r}.acl`);
                acl = `${r}.acl`;
            }

            messages.push({
                "@context": {
                    "tbd": "http://example.org/to-be-determined",
                    "acl": "http://www.w3.org/ns/auth/acl",
                    "as": "https://www.w3.org/ns/activitystreams",
                },
                "@type": "tbd:AppendRequest",
                "@id": `urn:loama:${crypto.randomUUID()}`,
                "as:actor": originWebId,
                "as:target": acl,
                "as:published": new Date().toISOString(),
                "as:object": {
                    "@id": `urn:loama:${crypto.randomUUID()}`,
                    "@type": "acl:Authorization",
                    "acl:agent": originWebId,
                    "acl:accessTo": r,
                    "acl:mode": permissions.map(p => ({ "@id": PermissionToACL(p) }))
                }
            });
        };

        const inbox = await this.inbox.getCurrent();
        inbox.push(...messages);
        await this.inbox.saveToRemote();
    }

    async sendResponseNotification(type: "accept" | "reject", message: AccessRequestMessage) {
        const inbox = await this.inbox.getCurrent();
        inbox.push({
            "@context": {
                "as": "https://www.w3.org/ns/activitystreams",
            },
            "@type": type == "accept" ? "as:Accept" : "as:Reject",
            "@id": `urn:loama:${crypto.randomUUID()}`,
            "as:actor": this.inbox.getDataUrl(),
            "as:object": {
                "@id": `urn:loama:${crypto.randomUUID()}`,
                "@type": "acl:Authorization",
                "acl:agent": message.actor,
                "acl:accessTo": message.target,
                "acl:mode": message.permissions.map(p => ({ "@id": p }))
            }
        });
        await this.inbox.saveToRemote();
    }

    async loadAccessRequests() {
        const messages = await this.inbox.getMessages();
        const parsedMessages: AccessRequestMessage[] = [];
        for (let [url, message] of Object.entries(messages)) {
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

            const entryTarget = getStringNoLocale(authorizationThing, "acl:accessTo");
            if (!entryTarget) {
                console.error("Inbox contains appendRequest without resource target");
                continue;
            }

            const entry: AccessRequestMessage = {
                id: url,
                actor: getStringNoLocale(appendRequest, "as:actor") ?? "Unknown actor",
                requestedAt: getDatetime(appendRequest, "as:published") ?? new Date(),
                target: entryTarget,
                permissions: [...(authorizationThing.predicates["acl:mode"].namedNodes ?? ["acl:Read"])],
            }
            parsedMessages.push(entry);
        }
        return parsedMessages;
    }

    async loadRequestResponses() {
        const messages = await this.inbox.getMessages();
        const parsedMessages: RequestResponseMessage[] = [];
        for (let [url, message] of Object.entries(messages)) {
            const allThings = getThingAll(message)
            const responseThing = allThings.filter(t => {
                const type = t.predicates["http://www.w3.org/1999/02/22-rdf-syntax-ns#type"].namedNodes?.[0];
                if (!type) return false;
                return REQUEST_RESPONSE_TYPES.includes(type)
            })?.[0];

            // This message does not contain a tbd:AppendRequest
            if (!responseThing) {
                continue
            }

            const authorizationUrl = getUrl(responseThing, "as:object");
            if (!authorizationUrl) {
                throw new Error(`Message with id ${url} does has no reference to an authorization object`);
            }

            const authorizationThing = allThings.filter(t => t.url === authorizationUrl)?.[0];
            if (!authorizationThing) {
                throw new Error(`Message with id ${url} does not contain the referenced authorization object`);
            }

            const entryTarget = getStringNoLocale(authorizationThing, "acl:accessTo");
            if (!entryTarget) {
                console.error(`Access request response without target resource in inbox`)
                continue
            }
            console.log(authorizationThing)

            const entry: RequestResponseMessage = {
                id: url,
                target: entryTarget,
                isAccepted: responseThing.predicates["http://www.w3.org/1999/02/22-rdf-syntax-ns#type"].namedNodes?.[0] === "as:Accept",
                permissions: [...(authorizationThing.predicates["acl:mode"].namedNodes ?? [])]
            }
            parsedMessages.push(entry);
        }
        return parsedMessages;
    }

    abstract removeRequest(messageUrl: string): Promise<void>;
}
