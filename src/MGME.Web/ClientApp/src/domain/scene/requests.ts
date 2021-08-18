import { Scene } from './interfaces';

import { PaginatedDataServiceResponse, ReadFromApi } from '../../shared/interfaces';

import { URLBuilder, DataController } from '../../shared/utils';

export const fetchScenes = async (adventureId: number, page?: string): Promise<void> => {
    const params: ReadFromApi['params'] = {
        adventureId: adventureId
    };

    if (page) {
        params['page'] = page;
    }

    await DataController.FetchAndSave<PaginatedDataServiceResponse<Scene[]>>(
        {
            url: URLBuilder.ReadFrom('scene'),
            params: params,
            page: 'adventureDetail',
            key: 'scenes'
        }
    );
};
