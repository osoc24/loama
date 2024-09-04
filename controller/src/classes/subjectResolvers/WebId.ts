import { Index, IndexItem } from "../../types";
import { ISubjectResolver } from "../../types/modules";
import { WebIdSubject } from "../../types/subjects";

export class WebIdResolver implements ISubjectResolver<WebIdSubject> {
    toLabel(subject: WebIdSubject): string {
        return subject.selector.url
    }

    checkMatch(subjectA: WebIdSubject, subjectB: WebIdSubject): boolean {
        if (subjectA.type !== "webId" || subjectB.type !== "webId") {
            return false;
        }
        return subjectA.selector.url === subjectB.selector.url;
    }

    getItem(index: Index<WebIdSubject>, resourceUrl: string, subjectSelector?: { url: string }) {
        return index.items.find(item => {
            return item.resource == resourceUrl && item.subject.type === "webId" && item.subject.selector && item.subject.selector.url === subjectSelector?.url
        })
    };
}
