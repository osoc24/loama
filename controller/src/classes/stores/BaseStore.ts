export abstract class BaseStore<T> {
    protected podUrl?: string = undefined;
    protected filePath: string;
    protected data?: T = undefined;

    constructor(filePath: string) {
        this.filePath = filePath
    }

    setPodUrl(url: string): void {
        this.podUrl = url;
        if (!this.podUrl.endsWith("/")) {
            this.podUrl += "/";
        }
    }

    unsetPodUrl(): void {
        this.podUrl = undefined;
    }

    getPodUrl() {
        return this.podUrl
    }

    getDataUrl() {
        return `${this.podUrl}${this.filePath}`
    }

    abstract getOrCreate(): Promise<T>;

    async getCurrent() {
        if (!this.data) {
            this.data = await this.getOrCreate();
        }
        return this.data;
    }
}
