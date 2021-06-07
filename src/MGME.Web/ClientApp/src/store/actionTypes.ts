/*
Since across multiple features we update store in the same way
It only makes sence to have shared actions types...
*/

export interface UpdateStore<TPayload> {
    type: 'UPDATE_STORE';
    reducer: string;
    key: string;
    payload: TPayload;
}

// Auth related action types:

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

