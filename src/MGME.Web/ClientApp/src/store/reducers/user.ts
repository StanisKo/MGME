import { Action, Reducer } from 'redux';

import { KnownAction } from '../shared';

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

    const { type, reducer, payload } = incomingAction as KnownAction;

    if (reducer !== 'user') {
        return state;
    }

    switch (type) {
        case 'UPDATE_STORE':

            return {
                // We only need to update 1 key/value that is already inside payload...
                ...(payload as unknown as UserState)
            };

        default:
            return state;
    }
};
