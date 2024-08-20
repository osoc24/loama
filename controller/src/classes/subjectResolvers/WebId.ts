import { Index, IndexItem, Type, UrlSubject } from "../../types";
import { ISubjectResolver } from "../types";

export class WedIdResolver implements ISubjectResolver<UrlSubject> {
    checkMatch(subjectA: UrlSubject, subjectB: UrlSubject): boolean {
        if (subjectA.type !== Type.WebID || subjectB.type !== Type.WebID) {
            return false;
        }
        return subjectA.selector.url === subjectB.selector.url;
    }

    getItem(index: Index, resourceUrl: string, subjectSelector?: unknown): IndexItem | undefined {
        return index.items.find(item => {
            return item.resource == resourceUrl && item.subject.type === Type.WebID && item.subject.selector && item.subject.selector.url === subjectSelector
        })
    };
}
