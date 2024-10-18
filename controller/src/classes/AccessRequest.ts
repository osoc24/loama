import { ResourceAccessRequestNode, Resources } from "@/types";
import { IAccessRequest, IStore } from "@/types/modules";

export class AccessRequest implements IAccessRequest {
    private resources: IStore<Resources>;

    constructor(resources: IStore<Resources>) {
        this.resources = resources;
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
}
