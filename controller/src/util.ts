import { Session } from "@inrupt/solid-client-authn-browser"

export const cacheBustedFetch = (session: Session) => (url: string | RequestInfo | URL, init?: RequestInit) => {
    return session.fetch(url, { ...init, cache: "no-cache" })
}
