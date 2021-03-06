import { ReactElement, useEffect, useState } from 'react';
import { Router, Switch, Redirect } from 'react-router-dom';
import { Provider } from 'react-redux';

import { store, LoginUser, LogoutUser, UpdateToken } from './store';

import { DataServiceResponse, UserTokenResponse, DecodedToken } from './shared/interfaces';

import { PublicRoute, PrivateRoute, MenuBar } from './shared/components';

import { ROUTES } from './shared/const';
import { history } from './shared/utils';

import { refreshToken } from './domain/auth/requests';

import { Login, ConfirmEmail } from './domain/auth';
import { UserProfile } from './domain/user';

import { Catalogues } from './domain/catalogues';

import { Adventures } from './domain/adventure';
import { AdventureDetailPage } from './domain/adventure/components';

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
                // We put a bool into localStorage for quicker renders between public/private routes
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
                store.dispatch<LoginUser>(
                    {
                        type: 'LOGIN_USER',
                        payload: {
                            token: token,
                            userRole: decoded.role
                        }
                    }
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

                    // We also clear out store since menu render depends on it
                    store.dispatch<LogoutUser>(
                        {
                            type: 'LOGOUT_USER'
                        }
                    );

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

                    store.dispatch<UpdateToken>(
                        {
                            type: 'UPDATE_TOKEN',
                            payload: {
                                token: token
                            }
                        }
                    );
                }
                else {
                    /*
                    If unable to refresh token and the app is running,
                    Repeat logout just as we do when user refreshes the page and the app is rebooted
                    */
                    const userLoggedIn = localStorage.getItem('userLoggedIn');

                    // Remove flag and redirect if user logged in
                    if (userLoggedIn) {
                        localStorage.removeItem('userLoggedIn');

                        // We also clear out store since menu render depends on it
                        store.dispatch<LogoutUser>(
                            {
                                type: 'LOGOUT_USER'
                            }
                        );

                        history.push(ROUTES.LOGIN);
                    }

                    console.clear();
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
                        <Redirect exact from={ROUTES.ROOT} to={ROUTES.LOGIN} />

                        <PublicRoute
                            restricted={true}
                            component={Login}
                            path={ROUTES.LOGIN}
                            setAccessTokenExpiresIn={setAccessTokenExpiresIn}
                        />

                        <PublicRoute restricted={true} component={ConfirmEmail} path={ROUTES.CONFIRM_EMAIL} />

                        <PrivateRoute component={UserProfile} path={ROUTES.USER_PROFILE} />

                        <PrivateRoute component={Catalogues} path={ROUTES.CATALOGUES} />

                        <PrivateRoute component={Adventures} path={ROUTES.ADVENTURES} />

                        <PrivateRoute component={AdventureDetailPage} path={ROUTES.ADVENTURE_DETAIL} />
                    </Switch>
                </Router>
            </ThemeProvider>
        </Provider>
    );
};
