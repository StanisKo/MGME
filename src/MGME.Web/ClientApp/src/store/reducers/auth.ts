import { Action, Reducer } from 'redux';

import { LoginUser, UpdateToken, LogoutUser } from '../actionTypes';

export interface AuthState {
    token: string;
    userRole: string;
}

/*
On init, we also parse user role and save it along the token

Afterwards, we update the token every time it's about to expire
*/

type KnownAction = LoginUser | UpdateToken | LogoutUser;

export const AuthReducer: Reducer<AuthState> = (state: AuthState | undefined, incomingAction: Action): AuthState => {
    if (state === undefined) {
        return {} as AuthState;
    }

    const action = incomingAction as KnownAction;

    switch (action.type) {
        case 'LOGIN_USER':
            return {
                ...action.payload
            };

        case 'UPDATE_TOKEN':
            return {
                ...state,
                token: action.payload.token
            };

        case 'LOGOUT_USER':
            return {} as AuthState;

        default:
            return state;
    }
};
