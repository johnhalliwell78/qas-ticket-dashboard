export function encodeBase64(str: string): string {
    var stringBuffer: Buffer = new Buffer(str);
    return stringBuffer.toString("base64");
}
