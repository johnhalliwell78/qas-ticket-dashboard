export class ArrayUtil {
    public static duplicateArray(source: any[]): any[] {
        const cloned = source.map(x => Object.assign({}, x));
        return cloned;
    }
}
