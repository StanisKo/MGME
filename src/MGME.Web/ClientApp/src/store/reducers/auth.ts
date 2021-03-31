import { Action, Reducer } from 'redux';

export interface AuthState {
    token: string;
    userId: number;
    userName: string;
    userRole: string;
}

/*
On init, we also parse user values and save them along the token

Afterwards, we update the token every time it's about to expire
*/

interface LoginUser {
    type: 'LOGIN_USER';
    payload: {
        token: string;
        userId: number;
        userName: string;
        userRole: string;
    }
}

interface UpdateToken {
    type: 'UPDATE_TOKEN';
    payload: {
        token: string;
    }
}

interface LogoutUser {
    type: 'LOGOUT_USER'
}

type KnownAction = LoginUser | UpdateToken | LogoutUser;

export const actionCreators = {
    loginUser: ({ type, payload }: LoginUser): LoginUser => ({
        type: type,
        payload: {
            token: payload.token,
            userId: payload.userId,
            userName: payload.userName,
            userRole: payload.userRole
        }
    }),

    updateToken: ({ type, payload }: UpdateToken): UpdateToken => ({
        type: type,
        payload: {
            token: payload.token
        }
    }),

    logoutUser: ({ type }: LogoutUser): LogoutUser => ({
        type: type
    })
};

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