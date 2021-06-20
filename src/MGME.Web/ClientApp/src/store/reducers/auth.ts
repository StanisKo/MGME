import { Action, Reducer } from 'redux';

import { LoginUser, UpdateToken, LogoutUser } from '../';

export interface AuthState {
    token: string;
    userRole: string;
}

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
