import { Action, Reducer } from 'redux';

import { PlayerCharacter } from '../../domain/catalogues/interfaces';
import { Pagination } from '../../shared/interfaces';

import { KnownAction } from '../shared';

export interface CataloguesState {
    playerCharacters: {
        data: PlayerCharacter[],
        pagination: Pagination
    },
}

export const CataloguesReducer: Reducer<CataloguesState> = (
    state: CataloguesState | undefined, incomingAction: Action): CataloguesState => {

    if (state === undefined) {
        return {} as CataloguesState;
    }

    const { type, reducer, key, payload } = incomingAction as KnownAction;

    if (reducer !== 'catalogues') {
        return state;
    }

    switch (type) {
        case 'UPDATE_STORE':

            return {
                ...state,
                [key]: payload as unknown as CataloguesState
            };

        default:
            return state;
    }
};
