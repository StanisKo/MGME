import { ReactElement, useEffect, useState } from 'react';
import { Router, Switch } from 'react-router-dom';
import { Provider } from 'react-redux';

import { store } from './store/configureStore';
import { actionCreators } from './store/reducers/auth';

import { DataServiceResponse, UserTokenResponse, DecodedToken } from './shared/interfaces';

import { MenuBar } from './shared/components/menu';
import { PublicRoute, PrivateRoute } from './shared/components/routes';

import { ROUTES } from './shared/const';
import { history } from './shared/utils';

import { refreshToken } from './domain/auth/requests';

import { Login, ConfirmEmail } from './domain/auth';

import { ItemOne } from './domain/itemOne';
import { ItemTwo } from './domain/itemTwo';
import { ItemThree } from './domain/itemThree';

import { CssBaseline, ThemeProvider } from '@material-ui/core';

import { base } from './shared/themes';

import jwt_decode from 'jwt-decode';

export const Application = (): ReactElement => {
    const [accessTokenExpiresIn, setAccessTokenExpiresIn] = useState<number>(0);

    /*
    On boot or page refresh, we attempt to refresh the access token
    If request is unsuccessfull, (refresh token expired) -- session has ended
    and user must login again; otherwise we propagate access token to the store
    */
    useEffect(() => {
        (async (): Promise<void> => {
            const refreshTokenResponse = await refreshToken();

            if (refreshTokenResponse.success) {
                // We put a bool into localStorage for quicker renders between routes
                localStorage.setItem('userLoggedIn', JSON.stringify(true));

                const token = (refreshTokenResponse as DataServiceResponse<UserTokenResponse>).data.accessToken;

                const decoded = jwt_decode(token) as DecodedToken;

                /*
                Our expiration time is 5 minutes
                we set refresh interval to 4 minutes expressed in milliseconds
                */
                setAccessTokenExpiresIn(
                    (decoded.exp - decoded.iat) * 1000 * 0.8
                );

                // We access store directly since scope is outside of Provider
                store.dispatch(
                    actionCreators.loginUser(
                        {
                            type: 'LOGIN_USER',
                            payload: {
                                token: token,
                                userId: decoded.nameid,
                                userName: decoded.unique_name,
                                userRole: decoded.role
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
                const userLoggedIn = localStorage.getItem('userLoggedIn');


                // Remove flag and redirect if user logged in
                if (userLoggedIn) {
                    localStorage.removeItem('userLoggedIn');

                    history.push(ROUTES.LOGIN);
                }

                console.clear();
            }
        })();
    }, []);

    useEffect(() => {
        // Check for init value to avoid dublicate requests
        if (accessTokenExpiresIn !== 0) {
            setInterval(async () => {
                const refreshTokenResponse = await refreshToken();

                if (refreshTokenResponse.success) {
                    const token = (refreshTokenResponse as DataServiceResponse<UserTokenResponse>).data.accessToken;

                    store.dispatch(
                        actionCreators.updateToken(
                            {
                                type: 'UPDATE_TOKEN',
                                payload: {
                                    token: token
                                }
                            }
                        )
                    );
                }
            }, accessTokenExpiresIn);
        }
    }, [accessTokenExpiresIn]);

    return (
        <Provider store={store}>
            <ThemeProvider theme={base}>
                <Router history={history}>
                    <CssBaseline />
                    <MenuBar />
                    <Switch>
                        <PublicRoute restricted={true} component={Login} path={ROUTES.LOGIN} />
                        <PublicRoute restricted={true} component={ConfirmEmail} path={ROUTES.CONFIRM_EMAIL} />

                        <PrivateRoute component={ItemOne} path={ROUTES.ITEM_ONE} />
                        <PrivateRoute component={ItemTwo} path={ROUTES.ITEM_TWO} />
                        <PrivateRoute component={ItemThree} path={ROUTES.ITEM_THREE} />
                    </Switch>
                </Router>
            </ThemeProvider>
        </Provider>
    );
};
