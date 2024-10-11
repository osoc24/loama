import { SubjectKey } from "@/types/modules";
import { BaseSubject, Index, Resources } from "../../types";

export abstract class BaseStore<T extends Record<keyof T, BaseSubject<keyof T & string>>> {
    protected podUrl?: string = undefined;
    protected index?: Index<T[keyof T]> = undefined;
    protected resources?: Resources = undefined;

    setPodUrl(url: string): void {
        this.podUrl = url;
    }

    unsetPodUrl(): void {
        this.podUrl = undefined;
    }

    abstract getOrCreateResources(): Promise<Resources>;

    async getCurrentResources() {
        if (!this.resources) {
            this.resources = await this.getOrCreateResources();
        }
        return this.resources as Resources;
    }

    abstract getOrCreateIndex(): Promise<Index<T[keyof T]>>;

    async getCurrentIndex<K extends SubjectKey<T>>() {
        if (!this.index) {
            this.index = await this.getOrCreateIndex();
        }
        return this.index as Index<T[K]>;
    }
}
