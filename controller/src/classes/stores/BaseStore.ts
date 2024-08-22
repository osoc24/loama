import { Index } from "../../types";

export abstract class BaseStore {
    protected podUrl?: string = undefined;
    protected index?: Index = undefined;

    setPodUrl(url: string): void {
        this.podUrl = url;
    }

    unsetPodUrl(): void {
        this.podUrl = undefined;
    }

    abstract getOrCreateIndex(): Promise<Index>;

    async getCurrentIndex(): Promise<Index> {
        if (!this.index) {
            this.index = await this.getOrCreateIndex();
        }
        return this.index;
    }
}
