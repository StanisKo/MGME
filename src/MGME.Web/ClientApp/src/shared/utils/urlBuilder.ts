export class URLBuilder {
    private static _baseURL = `/api/v${process.env.REACT_APP_API_VERSION}`;

    public static ReadFrom(entity: string, action: string | null = null): string {
        return `${URLBuilder._baseURL}/${entity}${action ? `/${action}` : ''}`;
    }

    public static WriteTo(entity: string, action: string): string {
        return `${URLBuilder._baseURL}/${entity}/${action}`;
    }
}
