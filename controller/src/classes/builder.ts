import { BaseSubject } from "../types";
import { AccessManagement } from "./AccessManagement";
import { IAccessManagement, IAccessManagementBuilder, IPermissionManager, IStore, ISubjectResolver } from "./types";

class AccessManagementBuilder implements IAccessManagementBuilder {
    private store: IStore | null = null;
    private subjectResolvers: Record<string, ISubjectResolver<BaseSubject>> = {};
    private permissionManager: IPermissionManager | null = null;

    setStore(store: IStore): IAccessManagementBuilder {
        this.store = store;
        return this;
    }

    addSubjectResolver(subjectType: string, subjectResolver: ISubjectResolver<BaseSubject>): IAccessManagementBuilder {
        this.subjectResolvers[subjectType] = subjectResolver
        return this;
    }

    setPermissionManager(permissionManager: IPermissionManager): IAccessManagementBuilder {
        this.permissionManager = permissionManager;
        return this;
    }

    build(): IAccessManagement {
        if (!this.store) throw new Error("Store is not set")
        if (!this.permissionManager) throw new Error("PermissionManager is not set")
        if (Object.keys(this.subjectResolvers).length == 0) throw new Error("SubjectResolvers are not set")

        return new AccessManagement(this.store, this.permissionManager, this.subjectResolvers)
    }
}
