import { Permission, ResourceAccessRequestNode, Resources } from "../types";
import { IAccessRequest, IController, IInboxConstructor, IStore } from "../types/modules";

export class AccessRequest implements IAccessRequest {
    private resources: IStore<Resources>;
    private inbox: IStore<unknown[]>;
    private controller: IController<{}>;

    constructor(controller: IController<{}>, inboxConstructor: IInboxConstructor, resourcesStore: IStore<Resources>) {
        this.controller = controller;
        this.resources = resourcesStore;
        this.inbox = new inboxConstructor("public/loama/inbox/") as IStore<unknown[]>;
    }

    async setPodUrl(url: string) {
        this.inbox.setPodUrl(url)
        // This will make sure we have the inbox created in our own container
        await this.inbox.getOrCreate();

        const publicController = this.controller.isSubjectSupported({ type: "public" });

        // Set permissions for info resources
        await publicController.addPermission(this.resources.getDataUrl(), Permission.Read, { type: "public" });
        await publicController.addPermission(this.inbox.getDataUrl(), Permission.Write, { type: "public" });
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

    async sendRequestNotification(originWebId: string, resources: string[]) {
        const messages = resources.map(r => {
            return {
                "@context": {
                    "tbd": "http://example.org/to-be-determined",
                    "acl": "http://www.w3.org/ns/auth/acl",
                    "as": "https://www.w3.org/ns/activitystreams",
                },
                "@type": "tbd:AppendRequest",
                // TODO: set ACL based on linkedResources
                "@id": `urn:loama:${crypto.randomUUID()}`,
                "as:actor": originWebId,
                "as:target": `${r}.acl`,
                "as:published": new Date().toISOString(),
                "as:object": {
                    "@id": `urn:loama:${crypto.randomUUID()}`,
                    "@type": "acl:Authorization",
                    "acl:agent": originWebId,
                    "acl:accessTo": r,
                    "acl:mode": [
                        {
                            "@id": "acl:Read"
                        }
                    ]
                }
            }
        });

        // TODO: check if this is actually possible with the RFC for LDN https://www.w3.org/TR/ldn/#sender
        const inbox = await this.inbox.getCurrent();
        console.log(messages)
        inbox.push(...messages);
        await this.inbox.saveToRemote();
    }
}
