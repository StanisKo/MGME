export class URLBuilder {
    private static _baseURL = `/api/v${process.env.REACT_APP_API_VERSION}`;

    public static buildGET(entity: string): string {
        return `${URLBuilder._baseURL}/${entity}`;
    }

    public static buildPOST(entity: string, action: string): string {
        return `${URLBuilder._baseURL}/${entity}/${action}`;
    }
}
