import { Action, Reducer } from 'redux';

export interface AuthState {
    token: string;
    userRole: string;
}

/*
On init, we also parse user role and save it along the token

Afterwards, we update the token every time it's about to expire

NOTE:
*/

export interface LoginUser {
    type: 'LOGIN_USER';
    payload: {
        token: string;
        userRole: string;
    }
}

export interface UpdateToken {
    type: 'UPDATE_TOKEN';
    payload: {
        token: string;
    }
}

export interface LogoutUser {
    type: 'LOGOUT_USER'
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
