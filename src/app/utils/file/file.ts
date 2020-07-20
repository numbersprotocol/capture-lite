export function fileNameWithoutExtension(uri: string) {
    return uri.match(/([^\/]+)(?=\.\w+$)/)[0];
}
