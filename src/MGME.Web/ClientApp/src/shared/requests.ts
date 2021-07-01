import { PaginatedDataServiceResponse, BaseServiceResponse } from './interfaces';

import { URLBuilder, DataController } from './utils';

interface AddToAdventureParams {
    adventure: number;
    playerCharacters?: number[];
    nonPlayerCharacters?: number[];
    keys: string[];
}

/*
TODO: implement request and think of DDD - does this file even needed?
*/

// Used for both adding PlayerCharacters and NPCs
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

export const fetchAdventures = async (): Promise<void> => {
    await DataController.FetchAndSave<PaginatedDataServiceResponse<unknown[]>>(
        {
            url: URLBuilder.ReadFrom('adventure'),
            page: 'catalogues',
            key: 'adventures'
        }
    );
};

