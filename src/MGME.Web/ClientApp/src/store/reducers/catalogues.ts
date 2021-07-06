import { Action, Reducer } from 'redux';

import { PlayerCharacter } from '../../domain/playerCharacter/interfaces';
import { NonPlayerCharacter } from '../../domain/nonPlayerCharacter/interfaces';
import { Adventure } from '../../domain/adventures/interfaces';

import { PaginatedDataServiceResponse, Pagination } from '../../shared/interfaces';

import { UpdateStore } from '../';

export interface CataloguesState {
    playerCharacters: {
        data: PlayerCharacter[],
        pagination: Pagination,
        selected: number[] | number
    },

    nonPlayerCharacters: {
        data: NonPlayerCharacter[],
        pagination: Pagination,
        selected: number[]
    },

    adventures: {
        data: Adventure[],
        pagination: Pagination,
        selected: number
    }
}

export const CataloguesReducer: Reducer<CataloguesState> = (
    state: CataloguesState | undefined, incomingAction: Action): CataloguesState => {

    if (state === undefined) {
        return {} as CataloguesState;
    }

    const { type, reducer, key, payload } =
        incomingAction as UpdateStore<PaginatedDataServiceResponse<PlayerCharacter[]>>;

    if (reducer !== 'catalogues') {
        return state;
    }

    switch (type) {
        case 'UPDATE_STORE':

            return {

                // Retain previous state of other keys
                ...state,

                // Update THIS key
                [key]: {

                    // Retain previous state of THIS key
                    ...state[key as keyof CataloguesState],

                    // Add/update things in THIS key
                    ...(payload as unknown as CataloguesState)
                }
            };

        default:
            return state;
    }
};
