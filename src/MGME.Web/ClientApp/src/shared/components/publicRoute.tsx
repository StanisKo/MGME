import { FunctionComponent, ReactElement } from 'react';
import { Route, Redirect } from 'react-router-dom';

import { ROUTES } from '../const';

interface Props {
    /*
    We declare indexer to allow passing variable props through this wrapper
    Without typing them along the way
    */
    [key: string]: unknown;

    component: FunctionComponent<{ [key: string]: unknown }>;
    path: string;
    restricted: boolean;
}

export const PublicRoute = ({component: FunctionComponent, restricted, ...props}: Props): ReactElement => {
    const userLoggedIn = localStorage.getItem('userLoggedIn');

    /*
    Restricted == false meaning public route that can be accessed at any time, logged in or not

    Restricted == true meaning public route that can be accessed only on specific condtions
    E.g., user is not logged in

    if user is logged in, restricted routes will return starting page
    */
    return (
        <Route {...props} render={(): ReactElement => (userLoggedIn && restricted
            ? <Redirect to={ROUTES.CATALOGUES} />
            : <FunctionComponent {...props} />
        )} />
    );
};
