import { Index, IndexItem } from "../../types";
import { PublicSubject } from "../../types/subjects";
import { ISubjectResolver } from "../../types/modules";

export class PublicResolver implements ISubjectResolver<PublicSubject> {
    toLabel(_subject: PublicSubject): string {
        return "Public"
    }

    checkMatch(subjectA: PublicSubject, subjectB: PublicSubject): boolean {
        if (subjectA.type !== "public" || subjectB.type !== "public") {
            return false;
        }
        return subjectA.type === subjectB.type
    }

    getItem(index: Index<PublicSubject>, resourceUrl: string, subjectSelector?: unknown) {
        return index.items.find(item => {
            return item.resource == resourceUrl && item.subject.type === "public"
        })
    };
}
