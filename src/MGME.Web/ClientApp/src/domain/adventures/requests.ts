import { Adventure } from './interfaces';

import {
    BaseServiceResponse,
    NewEntityToAdd,
    PaginatedDataServiceResponse,
    ReadFromApi
} from '../../shared/interfaces';

import { URLBuilder, DataController } from '../../shared/utils';

interface AddToAdventureParams {
    adventure: number;
    playerCharacters?: number[];
    nonPlayerCharacters?: number[];
    keys: string[];
}

type CreateAdventureParams = {
    title: string;
    context: string;
    chaosFactor?: number;
    playerCharacters: number[];
    threads: NewEntityToAdd[];
    newNonPlayerCharacters: NewEntityToAdd[];
    existingPlayerCharacters: number[];
}

export const addToAdventure = async (
    { adventure, playerCharacters, nonPlayerCharacters, keys }: AddToAdventureParams): Promise<BaseServiceResponse> => {

    return await DataController.UpdateAndRefetch(
        {
            url: URLBuilder.WriteTo('adventure', 'addto'),
            method: 'POST',
            body: {
                adventure: adventure,
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
            url: URLBuilder.WriteTo('adventures', 'add'),
            method: 'POST',
            body: params,
            page: 'adventures',
            keys: ['dataset']
        }
    );
};
