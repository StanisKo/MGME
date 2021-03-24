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

1. Improve email validation
2. Session management
3. Switch to http only or refresh + access token
4. Restrict access to login if user is logged in
*/

/*
On public and private routing:

https://medium.com/@thanhbinh.tran93/private-route-public-route-and-restricted-route-with-react-router-d50b27c15f5e
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
