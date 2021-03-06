import { User } from './interfaces';

import { BaseServiceResponse, DataServiceResponse } from '../../shared/interfaces';
import { URLBuilder, DataController } from '../../shared/utils';

interface UpdateUserProps {
    name?: string;
    email?: string;
}

interface ChangePasswordParams {
    oldPassword: string;
    newPassword: string;
    confirmPassword: string;
}

export const getUser = async (): Promise<void> => {
    await DataController.FetchAndSave<DataServiceResponse<User>>(
        {
            url: URLBuilder.ReadFrom('user'),
            page: 'user',
            key: 'data'
        }
    );
};

export const updateUser = async ({ name, email }: UpdateUserProps): Promise<BaseServiceResponse> => {
    return await DataController.UpdateAndRefetch(
        {
            url: URLBuilder.WriteTo('user', 'update'),
            method: 'PUT',
            body: {
                ...(name ? { name: name } : null),
                ...(email ? { email: email } : null)
            },
            page: 'user',
            keys: ['data']
        }
    ) as BaseServiceResponse;
};

export const changePassword = async (
    { oldPassword, newPassword, confirmPassword }: ChangePasswordParams): Promise<BaseServiceResponse> => {

    return await DataController.UpdateAndRefetch(
        {
            url: URLBuilder.WriteTo('user', 'change-password'),
            method: 'PUT',
            body: {
                oldPassword,
                newPassword,
                confirmPassword
            },
            page: 'user',
            keys: ['data']
        }
    ) as BaseServiceResponse;
};

export const deleteUser = async(): Promise<BaseServiceResponse | void> => {
    return await DataController.UpdateAndRefetch(
        {
            url: URLBuilder.WriteTo('user', 'delete'),
            method: 'DELETE',
            page: 'user',
            keys: ['data']
        }
    ) as BaseServiceResponse;
};

