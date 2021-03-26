export interface GET {
    page: string;
    key: string;
    url: string;
    params: { [key: string]: string | string[] | number | number[] | boolean } | null;
}

export interface POST {
    url: string;
    body: { [key: string]: string | number | number[] | boolean };
    page: string;
    keys: string[] | null;
}
