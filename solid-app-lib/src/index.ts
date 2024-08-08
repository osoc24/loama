import {
    getSolidDataset,
    getThingAll,
    getStringNoLocale,
    getUrl,
    getContainedResourceUrlAll,
    getDatetime,
} from "@inrupt/solid-client";
import { Session } from "@inrupt/solid-client-authn-browser";
import { Post, Appointment } from "./types";
import { Schema } from "loama-common";

export { Post, Appointment } from './types';
export { store } from './store';
export { podList } from './podlist.json';

/**
 * @param session An active Solid client connection
 * @param url URL to the user's pod
 * @returns Get the user's posts
 */
export async function getPosts(session: Session, url: string): Promise<Post[]> {
    const mapPost = (thing: any): Post => ({
        text: getStringNoLocale(thing, Schema.text) || "",
        video: getUrl(thing, Schema.video) || "",
        image: getUrl(thing, Schema.image) || "",
    });
    return fetchResources(session, `${url}/profile/posts/`, mapPost);
}


/**
 * @param session An active Solid client connection
 * @param url URL to the user's pod
 * @returns Get the user's appointments
 */
export async function getAppointments(
    session: Session,
    url: string
): Promise<Appointment[]> {
    const mapAppointment = (thing: any): Appointment => {
        const scheduledTime = getDatetime(thing, Schema.scheduledTime);
        return {
            type: getStringNoLocale(thing, Schema.additionalType) || "",
            location: getStringNoLocale(thing, Schema.location) || "",
            provider: getStringNoLocale(thing, Schema.provider) || "",
            date: scheduledTime ? new Date(scheduledTime).toLocaleDateString() : "",
            time: scheduledTime ? new Date(scheduledTime).toLocaleTimeString() : "",
        };
    };

    // As the appointments folder is borked, cooltoinments is used as a back-up.
    return fetchResources(session, `${url}/cooltoinments/`, mapAppointment);
}

/**
 * @param session An active Solid client connection
 * @param url URL to the user's pod
 * @param mapFunction Function to map Thing to required type
 * @returns The resources mapped to the required type
 */
async function fetchResources<T>(
    session: Session,
    url: string,
    mapFunction: (thing: any) => T
): Promise<T[]> {
    const dataset = await getSolidDataset(url, { fetch: session.fetch });
    const resources = getContainedResourceUrlAll(dataset);

    const result: T[] = [];

    await Promise.any(
        resources.map(async (resource) => {
            const resourceDataset = await getSolidDataset(resource, {
                fetch: session.fetch,
            });
            const things = getThingAll(resourceDataset);
            result.push(...things.map(mapFunction));
        })
    );

    return result;
}
