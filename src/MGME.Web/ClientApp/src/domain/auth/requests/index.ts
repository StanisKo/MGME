import { URLBuilder, request } from '../../../shared/utils/';
import { BaseServiceResponse, DataServiceResponse, UserTokenResponse } from '../../../shared/interfaces';

import { MODE } from '../helpers';

/*
We don't use DataController here, since we don't need to rely on JWT for these requests;
neither we require refetches after updates
*/

export const loginOrRegisterUser = async (
    mode: number,
    body: { [key: string]: string }

): Promise <BaseServiceResponse | DataServiceResponse<UserTokenResponse>> => {
    const action = mode === MODE.SIGN_UP ? 'register' : 'login';

    return await request<BaseServiceResponse | DataServiceResponse<UserTokenResponse>>(
        {
            url: URLBuilder.WriteTo('auth', action),
            method: 'POST',
            headers: null,
            body: body
        }
    );
};

export const confirmEmailAddress = async (token: string): Promise <BaseServiceResponse> => {
    return await request<BaseServiceResponse>(
        {
            url: URLBuilder.WriteTo('auth', 'confirm'),
            method: 'POST',
            headers: null,
            body: { token: token }
        }
    );
};

export const logoutUser = async (): Promise<BaseServiceResponse> => {
    return await request<BaseServiceResponse>(
        {
            url: URLBuilder.WriteTo('auth', 'logout'),
            method: 'GET',
            headers: null
        }
    );
};

export const refreshToken = async (): Promise <DataServiceResponse<UserTokenResponse>> => {
    return await request<DataServiceResponse<UserTokenResponse>>(
        {
            url: URLBuilder.ReadFrom('auth', 'refresh-token'),
            method: 'GET',
            headers: null
        }
    );
};
