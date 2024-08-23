import { Controller } from "./classes/Controller";
import { InruptPermissionManager } from "./classes/permissionManager/InruptPermissionManager";
import { InruptStore } from "./classes/stores/InruptStore";
import { PublicResolver } from "./classes/subjectResolvers/Public";
import { WebIdResolver } from "./classes/subjectResolvers/WebId";

// const inruptController = new AccessManagement<{
//     webId: WebIdSubject,
//     public: PublicSubject,
// }>(
//     new InruptStore(),
//     {
//         webId: new WebIdResolver(),
//         public: new PublicResolver(),
//     },
//     new InruptPermissionManager(),
// )

export const inruptController = new Controller(
    new InruptStore(),
    {
        webId: new WebIdResolver(),
        public: new PublicResolver()
    },
    new InruptPermissionManager(),
)
