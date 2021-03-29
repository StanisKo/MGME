export interface UserTokenResponse {
    accessToken: string;
}

export interface DecodedToken {
    nameid: number;
    unique_name: string;
    role: string;
}
