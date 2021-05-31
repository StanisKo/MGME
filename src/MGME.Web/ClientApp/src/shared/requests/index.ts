import { PaginatedDataServiceResponse, AvailableNonPlayerCharacter } from '../interfaces';

import { NON_PLAYER_CHARACTER_FILTER } from '../const/enums';

import { URLBuilder, DataController } from '../utils';

export const fetchAvailableNonPlayerCharacters = async (
    page?: number
): Promise <PaginatedDataServiceResponse<AvailableNonPlayerCharacter[]>> => {

    return await DataController.FetchAndSave<AvailableNonPlayerCharacter[]>(
        {
            url: URLBuilder.ReadFrom('nonplayercharacter'),
            params: {
                filter: NON_PLAYER_CHARACTER_FILTER.AVAILABLE,
                ...( page ? { page: page } : null )
            },
            returnResponse: true
        }
    ) as PaginatedDataServiceResponse<AvailableNonPlayerCharacter[]>;
};
