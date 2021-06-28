import { PaginatedDataServiceResponse, AvailableNonPlayerCharacter } from './interfaces';

import { NON_PLAYER_CHARACTER_FILTER } from './const/enums';

import { URLBuilder, DataController } from './utils';

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
