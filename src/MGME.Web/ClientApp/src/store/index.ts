import { AuthState, AuthReducer } from './reducers/auth';
import { UserState, UserReducer } from './reducers/user';
import { CataloguesState, CataloguesReducer } from './reducers/catalogues';

export interface ApplicationState {
    auth: AuthState | undefined;
    user: UserState | undefined;
    catalogues: CataloguesState | undefined;
}

export const reducers = {
    auth: AuthReducer,
    user: UserReducer,
    catalogues: CataloguesReducer
};

