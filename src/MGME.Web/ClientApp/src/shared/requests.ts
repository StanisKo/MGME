import { PaginatedDataServiceResponse, AvailableNonPlayerCharacter, BaseServiceResponse } from './interfaces';

import { NON_PLAYER_CHARACTER_FILTER } from './const/enums';

import { URLBuilder, DataController } from './utils';

interface AddToAdventureParams {
    adventure: number;
    playerCharacters?: number[];
    nonPlayerCharacters?: number[];
    keys: string[];
}

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

