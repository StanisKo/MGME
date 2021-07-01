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

export const fetchAdventures = async (): Promise<void> => {
    await DataController.FetchAndSave<PaginatedDataServiceResponse<unknown[]>>(
        {
            url: URLBuilder.ReadFrom('adventure'),
            page: 'catalogues',
            key: 'adventures'
        }
    );
};
