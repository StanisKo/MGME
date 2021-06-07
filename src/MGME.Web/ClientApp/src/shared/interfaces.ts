export interface BaseEntity {
    id: number;
}

/*    ****    */

export interface BaseServiceResponse {
    success: boolean;
    message: string;
}

export interface DataServiceResponse<TResult> extends BaseServiceResponse {
    data: TResult;
}

export interface PaginatedDataServiceResponse<TResult> extends DataServiceResponse<TResult> {
    pagination: Pagination;
}

export interface Pagination {
    page: number;
    numberOfPages: number;
    numberOfResults: number;
}

// Either NonPlayerCharacter or Thread
export interface NewEntityToAdd {
    name: string;
    description: string;
}

/*    ****    */

export interface RequestConfig {
    url: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
    headers?: { [key: string]: string };
    body?: { [key: string]: unknown };
}

export interface ReadFromApi {
    url: string;

    // We don't need params sometimes
    params?: { [key: string]: string | number | boolean | number[] | string[] };

    /*
    If we return reponse, no need to specify page and key
    As they are only needed to save data to store
    */
    page?: string;
    key?: string;

    /*
    We save response to store by default, so other components can access the data
    Yet, if this flag is provided, we don't, and return response to the caller
    */
    returnResponse?: boolean;
}

export interface WriteToApi {
    url: string;
    method: 'POST' | 'PUT' | 'DELETE';

    // Body is optional, since there are some edge cases when we use interface, but do need values (e.g., deleting user)
    body?: { [key: string]: string | number | boolean | number[] };

    // Required, since after updates we want to refetch
    page: string;

    // Optional, in case if we want to refetch every URL saved for that page
    keys?: string[] | null;
}

/*    ****    */

export interface DecodedToken {
    nameid: number;
    unique_name: string;
    role: string;
    iat: number;
    exp: number;
}

export interface UserTokenResponse {
    accessToken: string;
}

/*    ****    */

export interface HeadCell {
    label: string;
    sorting: string;
    numeric: boolean;
}

/*    **** Entity related interfaces ****    */

export interface AvailableNonPlayerCharacter {
    id: number;
    name: string;
}