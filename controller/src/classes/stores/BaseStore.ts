import { SubjectKey } from "@/types/modules";
import { BaseSubject, Index } from "../../types";

export abstract class BaseStore<T extends Record<keyof T, BaseSubject<keyof T & string>>> {
    protected podUrl?: string = undefined;
    protected index?: Index<T[keyof T]> = undefined;

    setPodUrl(url: string): void {
        this.podUrl = url;
    }

    unsetPodUrl(): void {
        this.podUrl = undefined;
    }

    abstract getOrCreateIndex(): Promise<Index<T[keyof T]>>;

    async getCurrentIndex<K extends SubjectKey<T>>() {
        if (!this.index) {
            this.index = await this.getOrCreateIndex();
        }
        return this.index as Index<T[K]>;
    }
}
