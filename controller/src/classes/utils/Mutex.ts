export class Mutex {
    private isLocked = false;
    private queue: {
        resolve: (cb: () => void) => void;
    }[] = [];

    acquire() {
        return new Promise<() => void>(resolve => {
            this.queue.push({ resolve });
            this.dispatch();
        })
    }

    private dispatch() {
        if (this.isLocked) {
            // The resource is still locked.
            // Wait until next time.
            return;
        }
        const nextEntry = this.queue.shift();
        if (!nextEntry) {
            // There is nothing in the queue.
            // Do nothing until next dispatch.
            return;
        }
        // The resource is available.
        this.isLocked = true; // Lock it.
        // and give access to the next operation
        // in the queue.
        nextEntry.resolve(this.buildRelease());
    }


    private buildRelease() {
        return () => {
            // Each release function make
            // the resource available again
            this.isLocked = false;
            // and call dispatch.
            this.dispatch();
        };
    }
}
