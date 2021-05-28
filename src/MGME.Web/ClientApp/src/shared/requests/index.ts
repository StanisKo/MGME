import { PaginatedDataServiceResponse, AvailableNonPlayerCharacter } from '../interfaces';

import { NON_PLAYER_CHARACTER_FILTER } from '../const/enums';

import { URLBuilder, request } from '../utils';

import { store } from '../../store/configureStore';

// We don't want to store this list in store, so simple request is enough
export const fetchNonPlayerCharacters = async (
    filter: NON_PLAYER_CHARACTER_FILTER
): Promise <PaginatedDataServiceResponse<AvailableNonPlayerCharacter>> => {

    return await request<PaginatedDataServiceResponse<AvailableNonPlayerCharacter>>(
        {
            url: URLBuilder.ReadFrom(`nonplayercharacter/?filter=${filter}`),
            method: 'GET',
            headers: { 'Authorization': `Bearer ${store.getState().auth?.token}` }
        }
    );
};
