import { PlayerCharacter } from './interfaces';

import { BaseServiceResponse, ReadFromApi } from '../../shared/interfaces';

import { URLBuilder, DataController } from '../../shared/utils';

export const fetchPlayerCharacters = async (page?: number, sorting?: string): Promise<void> => {
    const params: ReadFromApi['params'] = {};

    if (page) {
        params['page'] = page;
    }

    if (sorting) {
        params['sorting'] = sorting;
    }

    await DataController.FetchAndSave<PlayerCharacter[]>(
        {
            url: URLBuilder.ReadFrom('playercharacter'),
            ...(Object.keys(params).length > 0 ? { params: { ...params } } : null),
            page: 'catalogues',
            key: 'playerCharacters'
        }
    );
};

export const deletePlayerCharacters = async (ids: number[]): Promise<BaseServiceResponse> => {
    return await DataController.UpdateAndRefetch(
        {
            url: URLBuilder.WriteTo('playercharacter', 'delete'),
            method: 'DELETE',
            body: { ids: ids },
            page: 'catalogues',
            keys: ['playerCharacters']
        }
    ) as BaseServiceResponse;
};
