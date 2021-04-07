import { Action, Reducer } from 'redux';

import { KnownAction } from '../shared';

export interface UserState {
    name: string;
    email: string;
}

export const UserReducer: Reducer<UserState> = (state: UserState | undefined, incomingAction: Action): UserState => {
    if (state === undefined) {
        return {} as UserState;
    }

    const action = incomingAction as KnownAction;

    switch (action.type) {
        case 'UPDATE_STORE':
            const data = action.payload.data as unknown as UserState;

            return {
                name: data.name,
                email: data.email
            };

        default:
            return state;
    }
};
