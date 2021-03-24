import { ReactElement } from 'react';
import { Redirect, Route, Router, Switch } from 'react-router-dom';
import { Provider } from 'react-redux';

import configureStore from './store/configureStore';

import { Login, ConfirmEmail } from './domain/auth';
import { StartPage } from './domain/start';
import { MenuBar } from './shared/components/layout';

import { ROUTES } from './shared/const';
import { history } from './shared/utils';

import { CssBaseline } from '@material-ui/core';

const store = configureStore();

const PrivateApplication = (): ReactElement => (
    <>
        <MenuBar />
        <Switch>
            <Redirect exact from={ROUTES.ROOT} to={ROUTES.START} />
            <Route path={ROUTES.START} component={StartPage} />
        </Switch>
    </>
);

/*
TODO:

1. Switch to refresh + access token
2. Session management
3. Restrict access to login if user is logged in
4. Improve email validation
*/

/*
On refresh/access tokens workflow:

https://stackoverflow.com/questions/39176237/how-do-i-store-jwt-and-send-them-with-every-request-using-react

https://www.blinkingcaret.com/2018/05/30/refresh-tokens-in-asp-net-core-web-api/

Save access token in redux
Save refresh token in local storage

On public and private routing:

https://medium.com/@thanhbinh.tran93/private-route-public-route-and-restricted-route-with-react-router-d50b27c15f5e

Flow:

Upon login, server sends back to the client a refresh token and an access token
Refresh token is sent via httpOnly cookie and therefore persists between requests
Access token is simply saved in memory (redux store)

Client then sends acess token as auth header with every request

Client keeps tabs on access token expiration

When access token expires, client requests new access token from /refreshtoken endpoint

If user reloads the page, client requests new access token from /refreshtoken endpoint

When refresh token expires, the session must end
and the refresh token must be removed from cookies -- user must login again

https://www.youtube.com/watch?v=25GS0MLT8JU

Spec:

1. client app makes login request

2. /auth/login must:
    Login user
    Send back refresh token in httpOnly cookie
    Send back access token

3. client app must:
    Save access token in memory
    Refetch access token from /auth/refreshtoken when token expires
    Refetch access token from /auth/refreshtoken when user reloads the page

    (This can be in App.tsx?)

4. /auth/refreshtoken must:
    Validate the token
    Send back access token

Session continues until refresh token has not expired

5. Then client app must:
    make logout request that will delete refreshToken from httpOnly cookie (and in such end session)
*/

export const PublicApplication = (): ReactElement => {
    return (
        <Provider store={store}>
            <Router history={history}>
                <CssBaseline />
                <Switch>
                    <Route path={ROUTES.ROOT} render={(): ReactElement => {
                        const user = sessionStorage.getItem('token');

                        if (!user) {
                            return <Redirect to='/login' />;
                        }

                        return <PrivateApplication />;
                    }} />
                    <Route path={ROUTES.LOGIN} component={Login} />
                    <Route path={ROUTES.CONFIRM_EMAIL} component={ConfirmEmail} />
                </Switch>
            </Router>
        </Provider>
    );
};
