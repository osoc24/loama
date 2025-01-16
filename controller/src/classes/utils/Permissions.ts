import { Permission } from "../../types";

export const PermissionToACL = (permission: Permission): string => {
    switch (permission) {
        case Permission.Read:
            return "acl:Read"
        case Permission.Write:
            return "acl:Write"
        case Permission.Append:
            return "acl:Append"
        case Permission.Control:
            return "acl:Control"
        default:
            throw new Error("Permission not found");
    }
}
