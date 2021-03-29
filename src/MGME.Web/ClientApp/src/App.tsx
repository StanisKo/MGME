import { ReactElement } from 'react';
import { Router, Switch } from 'react-router-dom';
import { Provider } from 'react-redux';

import { store } from './store/configureStore';

import { Menu } from './shared/components/menu';
import { PublicRoute, PrivateRoute } from './shared/components/routes';

import { ROUTES } from './shared/const';
import { history } from './shared/utils';

import { Login, ConfirmEmail } from './domain/auth';
import { StartPage } from './domain/start';

import { CssBaseline } from '@material-ui/core';

export const Application = (): ReactElement => {
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
