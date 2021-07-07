import { NonPlayerCharacter, AvailableNonPlayerCharacter } from './interfaces';

import { NON_PLAYER_CHARACTER_FILTER } from '../../shared/const/enums';

import { PaginatedDataServiceResponse, BaseServiceResponse, ReadFromApi } from '../../shared/interfaces';

import { URLBuilder, DataController } from '../../shared/utils';

type CreateNonPlayerCharacterParams = {
    name: string;
    description: string;
    playerCharacter: number;
}

export const fetchNonPlayerCharacters = async (page?: number, sorting?: string): Promise<void> => {
    const params: ReadFromApi['params'] = {};

    /*
    Since API supports nullable page param to return non-paginated response
    We hardcode the page if none is provided
    */
    params['page'] = page ?? 1;

    if (sorting) {
        params['sorting'] = sorting;
    }

    await DataController.FetchAndSave<PaginatedDataServiceResponse<NonPlayerCharacter[]>>(
        {
            url: URLBuilder.ReadFrom('nonplayercharacter'),
            params: {
                filter: NON_PLAYER_CHARACTER_FILTER.ALL,
                ...(Object.keys(params).length > 0 ? params : null)
            },
            page: 'catalogues',
            key: 'nonPlayerCharacters'
        }
    );
};

export const fetchAvailableNonPlayerCharacters = async (
    filter: NON_PLAYER_CHARACTER_FILTER
): Promise <PaginatedDataServiceResponse<AvailableNonPlayerCharacter[]>> => {

    return await DataController.FetchAndSave<PaginatedDataServiceResponse<AvailableNonPlayerCharacter[]>>(
        {
            url: URLBuilder.ReadFrom('nonplayercharacter'),
            params: {
                filter: filter
            },
            returnResponse: true
        }
    ) as PaginatedDataServiceResponse<AvailableNonPlayerCharacter[]>;
};

export const deleteNonPlayerCharacters = async (ids: number[]): Promise<BaseServiceResponse> => {
    return await DataController.UpdateAndRefetch(
        {
            url: URLBuilder.WriteTo('nonplayercharacter', 'delete'),
            method: 'DELETE',
            body: { ids: ids },
            page: 'catalogues',
            keys: ['nonPlayerCharacters']
        }
    );
};

export const createNonPlayerCharacter = async (
    params: CreateNonPlayerCharacterParams): Promise<BaseServiceResponse> => {
    return await DataController.UpdateAndRefetch(
        {
            url: URLBuilder.WriteTo('nonplayercharacter', 'add'),
            method: 'POST',
            body: params,
            page: 'catalogues',
            keys: ['nonPlayerCharacters']
        }
    );
};
