import { Action, Reducer } from 'redux';

import { User } from '../../domain/user/interfaces';
import { DataServiceResponse } from '../../shared/interfaces';

import { UpdateStore } from '../';

export interface UserState {
    data: {
        name: string;
        email: string;
    }
}

export const UserReducer: Reducer<UserState> = (state: UserState | undefined, incomingAction: Action): UserState => {
    if (state === undefined) {
        return {} as UserState;
    }

    const { type, reducer, payload } = incomingAction as UpdateStore<DataServiceResponse<User>>;

    if (reducer !== 'user') {
        return state;
    }

    const { success, message, ...sanitizedPayload } = payload;

    switch (type) {
        case 'UPDATE_STORE':

            return {
                // We only need to update 1 key/value that is already inside payload...
                ...sanitizedPayload
            };

        default:
            return state;
    }
};
