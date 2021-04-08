import { User } from '../interfaces';
import { URLBuilder, DataController } from '../../../shared/utils';

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

export const updateUser = async (name?: string, email?: string): Promise<void> => {
    if (!name && !email) {
        throw new Error('Body params are missing');
    }

    await DataController.UpdateAndRefetch(
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

