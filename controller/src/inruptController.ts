import { AccessManagement } from "./classes/AccessManagement";
// import { AccessManagementBuilder } from "./classes/builder";
import { InruptPermissionManager } from "./classes/permissionManager/InruptPermissionManager";
import { InruptStore } from "./classes/stores/InruptStore";
import { PublicResolver } from "./classes/subjectResolvers/Public";
import { WebIdResolver } from "./classes/subjectResolvers/WebId";
import { PublicSubject, WebIdSubject } from "./types/subjects";

export const inruptController = new AccessManagement<{
    webId: WebIdSubject,
    public: PublicSubject,
}>(
    new InruptStore(),
    {
        webId: new WebIdResolver(),
        public: new PublicResolver(),
    },
    new InruptPermissionManager(),
)


inruptController.getItem("", {
    type: ""
})

export const implicitInruptController = new AccessManagement(
    new InruptStore(),
    {
        webId: new WebIdResolver(),
        public: new PublicResolver()
    },
    new InruptPermissionManager(),
)

implicitInruptController.getItem("", {
    type: ""
})

// export const inruptController = new AccessManagementBuilder<WebIdSubject | PublicSubject>()
//     .setStore()
//     .build()
//     .setPermissionManager()
//     .addSubjectResolver("webId", new WebIdResolver())
//     .addSubjectResolver("public", new PublicResolver())
//     .build()
