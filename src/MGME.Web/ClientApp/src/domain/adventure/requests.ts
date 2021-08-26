import { Adventure, AdventureDetail } from './interfaces';

import {
    BaseServiceResponse,
    DataServiceResponse,
    NewEntityToAdd,
    PaginatedDataServiceResponse,
    ReadFromApi
} from '../../shared/interfaces';

import { URLBuilder, DataController } from '../../shared/utils';

interface AddToAdventureParams {
    adventureId: number;
    playerCharacters?: number[];
    nonPlayerCharacters?: number[];
    keys: string[];
}

type CreateAdventureParams = {
    title: string;
    context: string;
    chaosFactor: number;
    playerCharacters: number[];
    threads: NewEntityToAdd[];
    newNonPlayerCharacters: NewEntityToAdd[];
    existingNonPlayerCharacters: number[];
}

export const addToAdventure = async (
    {
        adventureId,
        playerCharacters,
        nonPlayerCharacters,
        keys
    }: AddToAdventureParams): Promise<BaseServiceResponse> => {

    return await DataController.UpdateAndRefetch(
        {
            url: URLBuilder.WriteTo('adventure', 'addto'),
            method: 'POST',
            body: {
                adventureId: adventureId,
                playerCharacters: playerCharacters ?? [],
                nonPlayerCharacters: nonPlayerCharacters ?? []
            },
            page: 'catalogues',
            keys: keys
        }
    );
};

/*
We parametrize the reducer, since we might need to different datasets at the same point in time:
One on catalogues, from where user can add entities to adventures
Another on the actual list of adventures
*/
export const fetchAdventures = async (reducer: string, key: string, page?: number, sorting?: string): Promise<void> => {
    const params: ReadFromApi['params'] = {};

    if (page) {
        params['page'] = page;
    }

    if (sorting) {
        params['sorting'] = sorting;
    }

    await DataController.FetchAndSave<PaginatedDataServiceResponse<Adventure[]>>(
        {
            url: URLBuilder.ReadFrom('adventure'),
            ...(Object.keys(params).length > 0 ? { params: { ...params } } : null),
            page: reducer,
            key: key
        }
    );
};

export const createAdventure = async (params: CreateAdventureParams): Promise<BaseServiceResponse> => {
    return await DataController.UpdateAndRefetch(
        {
            url: URLBuilder.WriteTo('adventure', 'add'),
            method: 'POST',
            body: params,
            page: 'adventures',
            keys: ['dataset']
        }
    );
};

export const deleteAdventures = async (ids: number[]): Promise<BaseServiceResponse> => {
    return await DataController.UpdateAndRefetch(
        {
            url: URLBuilder.WriteTo('adventure', 'delete'),
            method: 'DELETE',
            body: { ids: ids },
            page: 'adventures',
            keys: ['dataset']
        }
    );
};

export const fetchAdventure = async (id: number): Promise<void> => {

    await DataController.FetchAndSave<DataServiceResponse<AdventureDetail>>(
        {
            url: URLBuilder.ReadFrom(`adventure/${id}`),
            page: 'adventureDetail',
            key: 'adventureData'
        }
    );
};
