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

export const PublicApplication = (): ReactElement => {
    return (
        <Provider store={store}>
            <Router history={history}>
                <CssBaseline />
                <MenuBar />
                <Switch>
                    <Route path={ROUTES.LOGIN} component={Login} />
                    <Route path={ROUTES.CONFIRM_EMAIL} component={ConfirmEmail} />
                    <Route path={ROUTES.ROOT} render={(): ReactElement => {
                        const user = sessionStorage.getItem('token');

                        if (!user) {
                            return <Redirect to='/login' />;
                        }

                        return <PrivateApplication />;
                    }} />
                </Switch>
            </Router>
        </Provider>
    );
};
