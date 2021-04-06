import { User } from '../interfaces';
import { DataServiceResponse } from '../../../shared/interfaces';
import { makeRequest, URLBuilder } from '../../../shared/utils';

export const getUser = async (): Promise<DataServiceResponse<User>> => {
    return await makeRequest<DataServiceResponse<User>>(
        {
            url: URLBuilder.buildGET('user'),
            method: 'GET',
            headers: null
        }
    );
};
