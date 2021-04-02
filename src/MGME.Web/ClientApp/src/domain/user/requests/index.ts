import { GetUserDTO } from '../interfaces';
import { DataServiceResponse } from '../../../shared/interfaces';
import { makeRequest, URLBuilder } from '../../../shared/utils';

export const getUser = async (): Promise<DataServiceResponse<GetUserDTO>> => {
    return await makeRequest<DataServiceResponse<GetUserDTO>>(
        {
            url: URLBuilder.buildGET('user'),
            method: 'GET',
            headers: null
        }
    );
};
