export interface PublicSubject {
    type: "public";
}

export interface UrlSubject<T extends string = "webId" | "group"> {
    type: T;
    selector: {
        url: string;
    }
}

export type WebIdSubject = UrlSubject<"webId">;
