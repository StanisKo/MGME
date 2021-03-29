import { FunctionComponent, ReactElement } from 'react';
import { Route, Redirect } from 'react-router-dom';

import { ROUTES } from '../../const';

interface Props {
    component: FunctionComponent<{ [key: string]: unknown }>;
    path: string;
    restricted: boolean;
}

export const PublicRoute = ({component: FunctionComponent, restricted, ...props}: Props): ReactElement => {
    const userLoggedIn = localStorage.getItem('userLoggedIn');
    /*
    restricted = false meaning public route
    restricted = true meaning restricted route

    if user is logged in, restricted routes will return starting page
    */
    return (
        <Route {...props} render={(props): ReactElement => (userLoggedIn && restricted
            ? <Redirect to={ROUTES.START} />
            : <FunctionComponent {...props} />
        )} />
    );
};
