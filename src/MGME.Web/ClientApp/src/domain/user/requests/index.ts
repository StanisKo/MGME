import { User } from '../interfaces';
import { URLBuilder, DataController } from '../../../shared/utils';

export const getUser = async (): Promise<void> => {
    await DataController.FetchAndSave<User>(
        {
            page: 'user',
            key: 'data',
            url: URLBuilder.ReadFrom('user'),
            params: null
        }
    );
};
