import { User } from '../interfaces';
import { URLBuilder, DataController } from '../../../shared/utils';
import { BaseServiceResponse } from '../../../shared/interfaces';

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
    await DataController.FetchAndSave<User>(
        {
            url: URLBuilder.ReadFrom('user'),
            params: null,
            page: 'user',
            key: 'data'
        }
    );
};

export const updateUser = async ({ name, email }: UpdateUserProps): Promise<BaseServiceResponse | void> => {
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
    );
};

export const changePassword = async (
    { oldPassword, newPassword, confirmPassword }: ChangePasswordParams): Promise<BaseServiceResponse | void> => {

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
    );
};

