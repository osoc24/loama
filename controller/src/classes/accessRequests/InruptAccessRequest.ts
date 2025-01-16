import { IAccessRequest, IController, IInboxConstructor, IStore } from "@/types/modules";
import { AccessRequest } from "./AccessRequest";
import { Resources } from "@/types";
import { getDefaultSession } from "@inrupt/solid-client-authn-browser";
import { deleteFile } from "@inrupt/solid-client";

export class InruptAccessRequest extends AccessRequest implements IAccessRequest {
    constructor(controller: IController<{}>, inboxConstructor: IInboxConstructor, resourcesStore: IStore<Resources>) {
        super(controller, inboxConstructor, resourcesStore)
    }

    async removeRequest(messageUrl: string) {
        const session = getDefaultSession();

        await deleteFile(messageUrl, {
            fetch: session.fetch
        })
    }
}
