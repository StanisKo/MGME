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

/*    ****    */

export interface RequestConfig {
    url: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
    headers: { [key: string]: string } | null;
    body?: { [key: string]: unknown } | null;
}

export interface ReadFromApi {
    page: string;
    key: string;
    url: string;
    params: { [key: string]: string | number | boolean | number[] | string[] } | null;
}

export interface WriteToApi {
    url: string;
    method: 'POST' | 'PUT' | 'DELETE';
    body: { [key: string]: string | number | boolean | number[] } | null;
    page: string;
    keys: string[] | null;
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
