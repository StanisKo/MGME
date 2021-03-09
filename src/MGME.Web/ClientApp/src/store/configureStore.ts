import { combineReducers, compose, createStore, Store } from 'redux';

import { ApplicationState, reducers } from './';

/*
On devTools setup:

https://github.com/zalmoxisus/redux-devtools-extension
*/

export default function configureStore(initialState?: ApplicationState): Store {
    const rootReducer = combineReducers({
        ...reducers
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
}
