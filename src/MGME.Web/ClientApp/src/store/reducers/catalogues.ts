import { Action, Reducer } from 'redux';

import { PlayerCharacter } from '../../domain/catalogues/interfaces';

import { KnownAction } from '../shared';

export interface CataloguesState {
    playerCharacters: PlayerCharacter[],
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
            const incoming = payload as unknown as CataloguesState;

            return {
                ...state,
                [key]: { ...incoming[key as keyof CataloguesState] }
            };

        default:
            return state;
    }
};
