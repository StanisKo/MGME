import { Action, Reducer } from 'redux';

import { AdventureDetail } from '../../domain/adventures/interfaces';

import { DataServiceResponse } from '../../shared/interfaces';

import { UpdateStore } from '..';

export interface AdventureDetailState {
    adventureData: AdventureDetail;
}

export const AdventureDetailReducer: Reducer<AdventureDetailState> = (
    state: AdventureDetailState | undefined, incomingAction: Action): AdventureDetailState => {

    if (state === undefined) {
        return {} as AdventureDetailState;
    }

    const { type, reducer, key, payload } =
        incomingAction as UpdateStore<DataServiceResponse<AdventureDetail>>;

    if (reducer !== 'adventureDetail') {
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
                    ...state[key as keyof AdventureDetailState],

                    // Add/update things in THIS key
                    ...payload.data
                }
            };

        default:
            return state;
    }
};
