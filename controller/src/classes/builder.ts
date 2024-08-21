import { BaseSubject } from "../types";
import { AccessManagement } from "./AccessManagement";
import { IAccessManagementBuilder, IPermissionManager, IStore, ISubjectResolver } from "../types/modules";

export class AccessManagementBuilder<T extends Record<string, BaseSubject<keyof T & string>>> implements IAccessManagementBuilder<T> {
    private store: IStore | null = null;
    // @ts-expect-error we cannot fill this record at this point
    private subjectResolvers: Record<keyof T, ISubjectResolver<keyof T & string>> = {};
    private permissionManager: IPermissionManager<T> | null = null;

    setStore(store: IStore): IAccessManagementBuilder {
        this.store = store;
        return this;
    }

    addSubjectResolver<SubjectType extends (keyof T & string)>(subjectType: string, subjectResolver: ISubjectResolver<SubjectType, BaseSubject<SubjectType>>): IAccessManagementBuilder<T & { [key in SubjectType]: BaseSubject<SubjectType>; }> {
        this.subjectResolvers[subjectType] = subjectResolver
        return this;
    }

    setPermissionManager(permissionManager: IPermissionManager<T>) {
        this.permissionManager = permissionManager;
        return this;
    }

    build() {
        if (!this.store) throw new Error("Store is not set")
        if (!this.permissionManager) throw new Error("PermissionManager is not set")
        if (Object.keys(this.subjectResolvers).length == 0) throw new Error("SubjectResolvers are not set")

        return new AccessManagement(this.store, this.permissionManager, this.subjectResolvers)
    }
}
