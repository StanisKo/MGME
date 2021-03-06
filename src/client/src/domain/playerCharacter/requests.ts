import { PlayerCharacter } from './interfaces';

import {
    BaseServiceResponse,
    NewEntityToAdd,
    PaginatedDataServiceResponse,
    ReadFromApi
} from '../../shared/interfaces';

import { URLBuilder, DataController } from '../../shared/utils';

/*
We use type and not interface to benefit
from required strong typing on calling the function
but not be contstraint by index signature of 'body' param on WriteToApi interface
*/
type CreateCharacterParams = {
    name: string;
    description: string;
    threads: NewEntityToAdd[];
    existingNonPlayerCharacters: number[];
    newNonPlayerCharacters: NewEntityToAdd[];
}

type AddToPlayerCharacterParams = {
    playerCharacterId: number;
    nonPlayerCharacters: number[];
}

export const fetchPlayerCharacters = async (page?: number, sorting?: string): Promise<void> => {
    const params: ReadFromApi['params'] = {};

    /*
    Since API supports nullable page param to return non-paginated response
    We explicitly provide page argument
    */
    params['page'] = page ?? 1;

    if (sorting) {
        params['sorting'] = sorting;
    }

    await DataController.FetchAndSave<PaginatedDataServiceResponse<PlayerCharacter[]>>(
        {
            url: URLBuilder.ReadFrom('playercharacter'),
            ...(Object.keys(params).length > 0 ? { params: { ...params } } : null),
            page: 'catalogues',
            key: 'playerCharacters'
        }
    );
};

export const fetchAvailablePlayerCharacters = async (): Promise<PaginatedDataServiceResponse<PlayerCharacter[]>> => {
    return await DataController.FetchAndSave<PaginatedDataServiceResponse<PlayerCharacter[]>>(
        {
            url: URLBuilder.ReadFrom('playercharacter'),
            returnResponse: true
        }
    ) as PaginatedDataServiceResponse<PlayerCharacter[]>;
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
    );
};

export const createPlayerCharacter = async (params: CreateCharacterParams): Promise<BaseServiceResponse> => {
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

export const addToPlayerCharacter = async (params: AddToPlayerCharacterParams): Promise<BaseServiceResponse> => {
    return await DataController.UpdateAndRefetch(
        {
            url: URLBuilder.WriteTo('playerCharacter', 'addto'),
            method: 'POST',
            body: params,
            page: 'catalogues',
            keys: ['nonPlayerCharacters']
        }
    );
};
