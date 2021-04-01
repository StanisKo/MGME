import { URLBuilder, makeRequest } from '../../../shared/utils/';
import { BaseServiceResponse, DataServiceResponse, UserTokenResponse } from '../../../shared/interfaces';

import { MODE } from '../helpers';

export const loginOrRegisterUser = async (
    mode: number,
    body: { [key: string]: string }

): Promise <BaseServiceResponse | DataServiceResponse<UserTokenResponse>> => {
    const action = mode === MODE.SIGN_UP ? 'register' : 'login';

    return await makeRequest<BaseServiceResponse | DataServiceResponse<UserTokenResponse>>(
        {
            url: URLBuilder.buildPOST('auth', action),
            method: 'POST',
            headers: null,
            body: body
        }
    );
};

export const confirmEmailAddress = async (token: string): Promise <BaseServiceResponse> => {
    return await makeRequest<BaseServiceResponse>(
        {
            url: URLBuilder.buildPOST('auth', 'confirm'),
            method: 'POST',
            headers: null,
            body: { token: token }
        }
    );
};

export const logoutUser = async (): Promise<BaseServiceResponse> => {
    return await makeRequest<BaseServiceResponse>(
        {
            url: URLBuilder.buildPOST('auth', 'logout'),
            method: 'GET',
            headers: null
        }
    );
};

export const refreshToken = async (): Promise <DataServiceResponse<UserTokenResponse>> => {
    return await makeRequest<DataServiceResponse<UserTokenResponse>>(
        {
            url: URLBuilder.buildPOST('auth', 'refresh-token'),
            method: 'GET',
            headers: null
        }
    );
};
