import { Action, Reducer } from 'redux';

import { PlayerCharacter } from '../../domain/catalogues/interfaces';
import { Pagination } from '../../shared/interfaces';

import { KnownAction } from '../shared';

export interface CataloguesState {
    playerCharacters: {
        data: PlayerCharacter[],
        pagination: Pagination,
        selected: number[],
        sorting: string
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
