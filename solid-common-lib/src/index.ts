import { getPodUrlAll, getSolidDataset, getStringNoLocale, getStringWithLocale, getThing, getUrl } from "@inrupt/solid-client";
import { Session } from "@inrupt/solid-client-authn-browser";
import { url } from "./types";
import { FOAF } from "@inrupt/vocab-common-rdf";

export { url } from "./types";

/**
 * List the pods that are from the currently authenticated user.
 * @param session An active Solid client connection
 * @returns The URL's to the pods the user has access to
 */
export async function listPodUrls(session: Session): Promise<url[]> {
    const urls = await getPodUrlAll(session.info.webId!, {
        fetch: session.fetch,
    });
    if (urls.length === 0) {
        urls.push((new URL('../', session.info.webId!)).toString())
    }
    return urls;
}


/**
 * @param session An active Solid client connection
 * @param url URL to the user's pod
 * @returns the information about the user
 */
export async function getProfileInfo(
    session: Session,
    url: url
): Promise<{
    name: string;
    mbox: string;
    description: string;
    img: string;
    phone: string;
}> {
    const dataset = await getSolidDataset(`${url}/profile/card#me`, {
        fetch: session.fetch,
    });
    const profileThing = getThing(dataset, `${url}/profile/card#me`);

    if (!profileThing) {
        throw new Error("Profile information not found");
    }

    const name = getStringNoLocale(profileThing, Schema.name) ?? "";
    const mbox = getUrl(profileThing, Schema.mbox) ?? "";
    const description =
        getStringWithLocale(profileThing, Schema.description, "en-us") ?? "";
    const img = getUrl(profileThing, Schema.img) ?? "";
    const phone = getUrl(profileThing, Schema.phone) ?? "";

    return { name, mbox, description, img, phone };
}

export const Schema = {
    name: FOAF.name,
    mbox: FOAF.mbox,
    description: "http://schema.org/description",
    img: FOAF.img,
    phone: FOAF.phone,

    text: "https://schema.org/text",
    video: "https://schema.org/video",
    image: "https://schema.org/image",

    additionalType: "https://schema.org/additionalType",
    location: "https://schema.org/location",
    provider: "https://schema.org/provider",
    scheduledTime: "https://schema.org/scheduledTime",
};

