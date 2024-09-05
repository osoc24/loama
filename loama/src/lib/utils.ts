export const uriToName = (uri: string, isContainer: boolean) => {
    const splitted = uri.split('/');

    return isContainer ? splitted[splitted.length - 2] : splitted[splitted.length - 1];
}
