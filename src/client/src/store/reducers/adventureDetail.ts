import { Action, Reducer } from 'redux';

import { AdventureDetail } from '../../domain/adventure/interfaces';
import { Scene } from '../../domain/scene/interfaces';

import { DataServiceResponse, PaginatedDataServiceResponse, Pagination } from '../../shared/interfaces';

import { UpdateStore } from '..';

export interface AdventureDetailState {
    adventureData: AdventureDetail,

    scenes: {
        data: Scene[],
        pagination: Pagination,
        selected: number
    }
}

export const AdventureDetailReducer: Reducer<AdventureDetailState> = (
    state: AdventureDetailState | undefined, incomingAction: Action): AdventureDetailState => {

    if (state === undefined) {
        return {} as AdventureDetailState;
    }

    const { type, reducer, key, payload } = incomingAction as UpdateStore<
        DataServiceResponse<AdventureDetail> | PaginatedDataServiceResponse<Scene[]>
    >;

    if (reducer !== 'adventureDetail') {
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
                    ...state[key as keyof AdventureDetailState],

                    /*
                    Add/update things in THIS key

                    If incoming data is information on adventure, we only need 'data' value

                    Otherwise, it's data with pagination, or custom value
                    places into store by script
                    */
                    ...(key === 'adventureData' ? sanitizedPayload.data : sanitizedPayload)
                }
            };

        default:
            return state;
    }
};
