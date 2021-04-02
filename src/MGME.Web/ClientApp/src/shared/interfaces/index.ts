export interface RequestConfig {
    url: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    headers: { [key: string]: string } | null,
    body?: { [key: string]: unknown }
}

export interface BaseServiceResponse {
    success: boolean;
    message: string;
}

export interface DataServiceResponse<TResult> extends BaseServiceResponse {
    data: TResult;
}

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

