import { Index, IndexItem, PublicSubject } from "../../types";
import { ISubjectResolver } from "../../types/modules";

export class PublicResolver implements ISubjectResolver<"public", PublicSubject> {
    checkMatch(subjectA: PublicSubject, subjectB: PublicSubject): boolean {
        if (subjectA.type !== "public" || subjectB.type !== "public") {
            return false;
        }
        return subjectA.type === subjectB.type
    }

    getItem(index: Index, resourceUrl: string, subjectSelector?: unknown): IndexItem | undefined {
        return index.items.find(item => {
            return item.resource == resourceUrl && item.subject.type === "public"
        })
    };
}
