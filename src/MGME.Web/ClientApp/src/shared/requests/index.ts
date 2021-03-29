import { URLBuilder, makeRequest } from '../utils';
import { DataServiceResponse, UserTokenResponse } from '../interfaces';

export const refreshToken = async (): Promise <DataServiceResponse<UserTokenResponse>> => {
    return await makeRequest<DataServiceResponse<UserTokenResponse>>(
        {
            url: URLBuilder.buildPOST('auth', 'refresh-token'),
            method: 'GET',
            headers: null
        }
    );
};
