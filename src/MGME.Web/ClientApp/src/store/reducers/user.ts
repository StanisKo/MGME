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

    const { type, reducer, key, payload } = incomingAction as KnownAction;

    if (reducer !== 'user') {
        return state;
    }

    switch (type) {
        case 'UPDATE_STORE':
            const incoming = payload as unknown as UserState;

            return {
                ...state,
                [key]: { ...incoming[key as keyof UserState] }
            };

        default:
            return state;
    }
};
