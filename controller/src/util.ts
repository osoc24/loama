import { Session } from "@inrupt/solid-client-authn-browser"

export const cacheBustedSessionFetch = (session: Session) => (url: string | RequestInfo | URL, init?: RequestInit) => {
    return session.fetch(url, { ...init, cache: "no-cache" })
}

export const cacheBustedFetch = (url: string | RequestInfo | URL, init?: RequestInit) => {
    return fetch(url, { ...init, cache: "no-cache" })
}
