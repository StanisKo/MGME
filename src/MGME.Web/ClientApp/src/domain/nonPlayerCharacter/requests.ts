import { NonPlayerCharacter } from './interfaces';

import { NON_PLAYER_CHARACTER_FILTER } from '../../shared/const/enums';

import { PaginatedDataServiceResponse, ReadFromApi } from '../../shared/interfaces';

import { URLBuilder, DataController } from '../../shared/utils';

export const fetchNonPlayerCharacters = async (page?: number, sorting?: string): Promise<void> => {
    const params: ReadFromApi['params'] = {};

    /*
    Since API supports nullable page param to return non-paginated response
    We hardcode the page if none is provided
    */
    if (page) {
        params['page'] = page ?? 1;
    }

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
