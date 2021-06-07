import { combineReducers, compose, createStore, Store } from 'redux';

import { AuthState, AuthReducer } from './reducers/auth';
import { UserState, UserReducer } from './reducers/user';
import { CataloguesState, CataloguesReducer } from './reducers/catalogues';

import { UpdateStore, LoginUser, UpdateToken, LogoutUser } from './actionTypes';

// Shape of the store
interface ApplicationState {
    auth: AuthState | undefined;
    user: UserState | undefined;
    catalogues: CataloguesState | undefined;
}

// Config
const configureStore = (initialState?: ApplicationState): Store => {
    const rootReducer = combineReducers({
        auth: AuthReducer,
        user: UserReducer,
        catalogues: CataloguesReducer
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const windowIfDefined = typeof window === 'undefined' ? null : window as any;

    const devTools = windowIfDefined && windowIfDefined.__REDUX_DEVTOOLS_EXTENSION__
        ? windowIfDefined.__REDUX_DEVTOOLS_EXTENSION__()
        : compose;

    return createStore(
        rootReducer,
        initialState,
        compose(devTools)
    );
};

/*
We export store directly in order to access it and dispatch to
From components that are outside of Provider
*/
export const store = configureStore();

// We export types to work with store
export type { ApplicationState, UpdateStore, LoginUser, UpdateToken, LogoutUser };

