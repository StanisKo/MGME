import { BaseServiceResponse, PaginatedDataServiceResponse } from '../../shared/interfaces';

import { URLBuilder, DataController } from '../../shared/utils';

interface AddToAdventureParams {
    adventure: number;
    playerCharacters?: number[];
    nonPlayerCharacters?: number[];
    keys: string[];
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
We parametrize the page, since we might need to different datasets at the same point in time:
One on catalogues, from where user can add entities to adventures
Another on the actual list of adventures
*/
export const fetchAdventures = async (page: string): Promise<void> => {
    await DataController.FetchAndSave<PaginatedDataServiceResponse<unknown[]>>(
        {
            url: URLBuilder.ReadFrom('adventure'),
            page: page,
            key: 'adventures'
        }
    );
};
