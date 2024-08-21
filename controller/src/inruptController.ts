import { AccessManagementBuilder } from "./classes/builder";
import { InruptPermissionManager } from "./classes/permissionManager/InruptPermissionManager";
import { InruptStore } from "./classes/stores/InruptStore";
import { PublicResolver } from "./classes/subjectResolvers/Public";
import { WebIdResolver } from "./classes/subjectResolvers/WebId";

export const inruptController = new AccessManagementBuilder()
    .setStore(new InruptStore())
    .setPermissionManager(new InruptPermissionManager())
    .addSubjectResolver("webId", new WebIdResolver())
    .addSubjectResolver("public", new PublicResolver())
    .build()
