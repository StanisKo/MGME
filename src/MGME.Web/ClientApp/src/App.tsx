import { ReactElement } from 'react';
import { Redirect, Route, Router, Switch } from 'react-router-dom';
import { Provider } from 'react-redux';

import configureStore from './store/configureStore';

import { StartPage, LoginPage } from './domain';

import { ROUTES } from './shared/const';
import { history } from './shared/utils';

const store = configureStore();

const PrivateApplication = (): ReactElement => (
    <Switch>
        <Redirect exact from={ROUTES.ROOT} to={ROUTES.START} />
        <Route path={ROUTES.START} component={StartPage} />
    </Switch>
);

export const PublicApplication = (): ReactElement => {
    return (
        <Provider store={store}>
            <Router history={history}>
                <Switch>
                    <Route path={ROUTES.LOGIN} component={LoginPage} />
                    <Route path={ROUTES.ROOT} render={(): ReactElement => {
                        const user = sessionStorage.getItem('user');

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
