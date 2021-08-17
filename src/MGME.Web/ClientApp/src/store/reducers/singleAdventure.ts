import { Action, Reducer } from 'redux';

import { AdventureDetail } from '../../domain/adventures/interfaces';

import { DataServiceResponse } from '../../shared/interfaces';

import { UpdateStore } from '..';

export interface SingleAdventureState {
    adventureData: AdventureDetail;
}

export const SingleAdventureReducer: Reducer<SingleAdventureState> = (
    state: SingleAdventureState | undefined, incomingAction: Action): SingleAdventureState => {

    if (state === undefined) {
        return {} as SingleAdventureState;
    }

    const { type, reducer, key, payload } =
        incomingAction as UpdateStore<DataServiceResponse<AdventureDetail>>;

    if (reducer !== 'singleAdventure') {
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
                    ...state[key as keyof SingleAdventureState],

                    // Add/update things in THIS key
                    ...payload
                }
            };

        default:
            return state;
    }
};
