import { Resources } from "@/types";
import { IAccessRequest, IStore } from "@/types/modules";

export class AccessRequest implements IAccessRequest {
    private resources: IStore<Resources>;

    constructor(resources: IStore<Resources>) {
        this.resources = resources;
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
