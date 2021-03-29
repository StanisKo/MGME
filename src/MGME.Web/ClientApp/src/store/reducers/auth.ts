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

export interface ParseUser {
    type: 'PARSE_USER';
    payload: {
        token: string;
        userId: number;
        userName: string;
        userRole: string;
    }
}

export interface UpdateToken {
    type: 'UPDATE_TOKEN';
    payload: {
        token: string;
    }
}

export type KnownAction = ParseUser | UpdateToken;

export const actionCreators = {
    parseUser: ({ type, payload }: ParseUser): ParseUser => ({
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
    })
};

export const AuthReducer: Reducer<AuthState> = (state: AuthState | undefined, incomingAction: Action): AuthState => {
    if (state === undefined) {
        return {} as AuthState;
    }

    const action = incomingAction as KnownAction;

    switch (action.type) {
        case 'PARSE_USER':
            return {
                ...action.payload
            };

        case 'UPDATE_TOKEN':
            return {
                ...state,
                token: action.payload.token
            };

        default:
            return state;
    }
};
