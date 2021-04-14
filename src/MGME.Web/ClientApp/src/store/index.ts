import { AuthState, AuthReducer } from './reducers/auth';
import { UserState, UserReducer } from './reducers/user';

export interface ApplicationState {
    auth: AuthState | undefined;
    user: UserState | undefined;
}

export const reducers = {
    auth: AuthReducer,
    user: UserReducer
};

