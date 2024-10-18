export const uriToName = (uri: string, isContainer: boolean) => {
    const splitted = uri.split('/');

    return isContainer ? splitted[splitted.length - 2] : splitted[splitted.length - 1];
}

export const debounce = (fn: Function, wait: number) => {
    let timer: NodeJS.Timeout;
    return function(...args: any[]) {
        if (timer) {
            clearTimeout(timer); // clear any pre-existing timer
        }
        // @ts-expect-error this is the current context
        const context = this; // get the current context
        timer = setTimeout(() => {
            fn.apply(context, args); // call the function if time expires
        }, wait);
    }
}
