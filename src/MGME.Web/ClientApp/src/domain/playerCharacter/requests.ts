import { PlayerCharacter } from './interfaces';

import { BaseServiceResponse, NewEntityToAdd, ReadFromApi } from '../../shared/interfaces';

import { URLBuilder, DataController } from '../../shared/utils';

interface CreateCharacterParams {
    name: string;
    description: string;
    threads: NewEntityToAdd[];
    existingNonPlayerCharacters: number[];
    newNonPlayerCharacters: NewEntityToAdd[];
}

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

export const deletePlayerCharacters = async (ids: number[]): Promise<BaseServiceResponse | Error> => {
    return await DataController.UpdateAndRefetch(
        {
            url: URLBuilder.WriteTo('playercharacter', 'delete'),
            method: 'DELETE',
            body: { ids: ids },
            page: 'catalogues',
            keys: ['playerCharacters']
        }
    );
};

export const createPlayerCharacter = async (params: CreateCharacterParams): Promise<BaseServiceResponse | Error> => {
    return await DataController.UpdateAndRefetch(
        {
            url: URLBuilder.WriteTo('playercharacter', 'add'),
            method: 'POST',
            body: params,
            page: 'catalogues',
            keys: ['playerCharacters']
        }
    );
};
