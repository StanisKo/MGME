import { Action, Reducer } from 'redux';

import { Adventure } from '../../domain/adventure/interfaces';

import { PaginatedDataServiceResponse, Pagination } from '../../shared/interfaces';

import { UpdateStore } from '../';

export interface AdventuresState {
    dataset: {
        data: Adventure[],
        pagination: Pagination,
        selected: number[]
    }
}

export const AdventuresReducer: Reducer<AdventuresState> = (
    state: AdventuresState | undefined, incomingAction: Action): AdventuresState => {

    if (state === undefined) {
        return {} as AdventuresState;
    }

    const { type, reducer, key, payload } =
        incomingAction as UpdateStore<PaginatedDataServiceResponse<Adventure[]>>;

    if (reducer !== 'adventures') {
        return state;
    }

    const { success, message, ...sanitizedPayload } = payload;

    switch (type) {
        case 'UPDATE_STORE':

            return {

                // Retain previous state of other keys
                ...state,

                // Update THIS key
                [key]: {

                    // Retain previous state of THIS key
                    ...state[key as keyof AdventuresState],

                    // Add/update things in THIS key
                    ...sanitizedPayload
                }
            };

        default:
            return state;
    }
};
