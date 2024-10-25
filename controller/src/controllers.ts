import { Controller } from "./classes/Controller";
import { PublicManager } from "./classes/permissionManager/inrupt/PublicManager";
import { WebIdManager } from "./classes/permissionManager/inrupt/WebIdManager";
import { InruptInboxStore } from "./classes/stores/InruptInboxStore";
import { InruptStore } from "./classes/stores/InruptStore";
import { PublicResolver } from "./classes/subjectResolvers/Public";
import { WebIdResolver } from "./classes/subjectResolvers/WebId";
import { PublicSubject, WebIdSubject } from "./types/subjects";

export const createBasicController = () => {
    return new Controller<{
        webId: WebIdSubject,
        public: PublicSubject,
    }>(
        InruptStore,
        InruptInboxStore,
        {
            webId: {
                resolver: new WebIdResolver(),
                manager: new WebIdManager()
            },
            public: {
                resolver: new PublicResolver(),
                manager: new PublicManager(),
            },
        },
    )
}

export const activeController = createBasicController()
