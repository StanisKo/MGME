import { URLBuilder } from '../../../shared/utils/';
import { DataServiceResponse } from '../../../shared/interfaces';

import { MODE } from '../helpers';

/*
TODO:

Build data controller as an abstraction level around requests
*/

export const loginOrRegisterUser = async <TResult>(
    mode: number,
    body: { [key: string]: string }

): Promise <DataServiceResponse<TResult>> => {
    const entity = 'auth';
    const action = mode === MODE.SIGN_UP ? 'register' : 'login';

    try {
        const request = await fetch(
            URLBuilder.buildPOST(entity, action),
            {
                method: 'POST',
                body: JSON.stringify(body),
                credentials: 'same-origin',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            }
        );

        const response = await request.json();

        return response;
    }
    catch (error) {
        return error;
    }
};
