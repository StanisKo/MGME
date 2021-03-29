import { ReactElement, useEffect } from 'react';
import { Router, Switch } from 'react-router-dom';
import { Provider } from 'react-redux';

import { store } from './store/configureStore';
import { actionCreators } from './store/reducers/auth';

import { Menu } from './shared/components/menu';
import { PublicRoute, PrivateRoute } from './shared/components/routes';

import { ROUTES } from './shared/const';
import { history } from './shared/utils';

import { refreshToken } from './shared/requests';

import { Login, ConfirmEmail } from './domain/auth';
import { StartPage } from './domain/start';

import { CssBaseline } from '@material-ui/core';

export const Application = (): ReactElement => {
    /*
    On boot or page refresh, we attempt to refresh the access token
    If request is unsuccessfull, (refresh token expired) -- sessions has ended
    and user must login again; otherwise we propagate access token to the store
    */
    useEffect(() => {
        (async (): Promise<void> => {
            const refreshTokenResponse = await refreshToken();

            if (refreshTokenResponse.success) {
                // We put a bool into localStorage for quicker renders between routes
                localStorage.setItem('userLoggedIn', JSON.stringify(true));

                // We access store directly since scope is outside of Provider
                store.dispatch(
                    actionCreators.updateToken(
                        {
                            type: 'UPDATE_TOKEN',
                            payload: {
                                token: refreshTokenResponse.data.accessToken
                            }
                        }
                    )
                );
            }
            else {
                /*
                We don't handle 401 in any specific way since
                we treat it as a signal of finished sessions, no more no less
                */
                console.clear();
            }
        })();

        // We clear out bool from local storage on destroy
        return (): void => {
            localStorage.removeItem('userLoggedIn');
        };
    }, []);

    return (
        <Provider store={store}>
            <Router history={history}>
                <CssBaseline />
                <Menu />
                <Switch>
                    <PublicRoute restricted={true} component={Login} path={ROUTES.LOGIN} />
                    <PublicRoute restricted={true} component={ConfirmEmail} path={ROUTES.CONFIRM_EMAIL} />

                    <PrivateRoute component={StartPage} path={ROUTES.START} />
                </Switch>
            </Router>
        </Provider>
    );
};
