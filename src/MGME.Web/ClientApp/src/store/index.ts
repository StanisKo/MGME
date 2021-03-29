import { AuthState, AuthReducer } from './reducers/auth';

export interface ApplicationState {
    auth: AuthState | undefined;
}

export const reducers = {
    auth: AuthReducer
};

