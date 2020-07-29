export function fileNameWithoutExtension(uri: string) {
    // tslint:disable-next-line: no-non-null-assertion
    return uri.match(/([^\/]+)(?=\.\w+$)/)![0];
}
