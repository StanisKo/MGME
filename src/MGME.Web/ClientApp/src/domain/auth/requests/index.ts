import { URLBuilder, makeRequest } from '../../../shared/utils/';
import { BaseServiceResponse, DataServiceResponse } from '../../../shared/interfaces';
import { UserTokenResponse } from '../interfaces';

import { MODE } from '../helpers';

export const loginOrRegisterUser = async (
    mode: number,
    body: { [key: string]: string }

): Promise <BaseServiceResponse | DataServiceResponse<UserTokenResponse>> => {
    const entity = 'auth';
    const action = mode === MODE.SIGN_UP ? 'register' : 'login';

    return await makeRequest<BaseServiceResponse | DataServiceResponse<UserTokenResponse>>(
        {
            url: URLBuilder.buildPOST(entity, action),
            method: 'POST',
            headers: null,
            body: body
        }
    );
};

export const confirmEmailAddress = async (token: string): Promise <BaseServiceResponse> => {
    const entity = 'auth';
    const action = 'confirm';

    return await makeRequest<BaseServiceResponse | DataServiceResponse<UserTokenResponse>>(
        {
            url: URLBuilder.buildPOST(entity, action),
            method: 'POST',
            headers: null
        }
    );
};
