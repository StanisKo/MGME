import { ReactElement } from 'react';
import { Redirect, Route, Router, Switch } from 'react-router-dom';
import { Provider, useSelector } from 'react-redux';

import { store } from './store/configureStore';
import { ApplicationState } from './store';

import { Login, ConfirmEmail } from './domain/auth';
import { StartPage } from './domain/start';
import { Menu } from './shared/components/menu';

import { ROUTES } from './shared/const';
import { history } from './shared/utils';

import { CssBaseline } from '@material-ui/core';

const PrivateApplication = (): ReactElement => (
    <>
        <Menu />
        <Switch>
            <Redirect exact from={ROUTES.ROOT} to={ROUTES.START} />
            <Route path={ROUTES.START} component={StartPage} />
        </Switch>
    </>
);

export const PublicApplication = (): ReactElement => {
    const userIsLoggedIn = useSelector(
        (store: ApplicationState) => store.auth?.token ?? null
    );

    return (
        <Provider store={store}>
            <Router history={history}>
                <CssBaseline />
                <Switch>
                    <Route path={ROUTES.LOGIN} render={(): ReactElement => {
                        if (userIsLoggedIn) {
                            return <Redirect to={ROUTES.START} />;
                        }

                        return <Login />;
                    }} />
                    <Route path={ROUTES.CONFIRM_EMAIL} component={ConfirmEmail} />

                    <Route path={ROUTES.ROOT} render={(): ReactElement => {
                        if (userIsLoggedIn === null) {
                            return <Redirect to={ROUTES.LOGIN} />;
                        }

                        return <PrivateApplication />;
                    }} />
                </Switch>
            </Router>
        </Provider>
    );
};

export const ContextWrapper = (): ReactElement => {
    return (
        <Provider store={store}>
            <Router history={history}>
                <CssBaseline />
                <PublicApplication />
            </Router>
        </Provider>
    );
};

