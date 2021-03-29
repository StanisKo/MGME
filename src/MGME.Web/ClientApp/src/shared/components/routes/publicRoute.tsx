import React, { FunctionComponent, ReactElement } from 'react';
import { Route, Redirect } from 'react-router-dom';
import { useSelector } from 'react-redux';

import { ApplicationState } from '../../../store';
import { ROUTES } from '../../const';

interface Props {
    component: FunctionComponent<{ [key: string]: unknown }>;
    path: string;
    restricted: boolean;
}

export const PublicRoute = ({component: FunctionComponent, restricted, ...props}: Props): ReactElement => {
    const userIsLoggedIn = useSelector((store: ApplicationState) => store.auth?.token ?? null);

    /*
    restricted = false meaning public route
    restricted = true meaning restricted route

    if user is logged in, restricted routes will return starting page
    */
    return (
        <Route {...props} render={(props): ReactElement => (userIsLoggedIn && restricted
            ? <Redirect to={ROUTES.START} />
            : <FunctionComponent {...props} />
        )} />
    );
};
