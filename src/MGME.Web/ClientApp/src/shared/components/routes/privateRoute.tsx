import { FunctionComponent, ReactElement } from 'react';
import { Route, Redirect } from 'react-router-dom';

import { ROUTES } from '../../const';

interface Props {
    component: FunctionComponent<{ [key: string]: unknown }>;
    path: string;
}

export const PrivateRoute = ({component: FunctionComponent, ...props}: Props): ReactElement => {
    const userLoggedIn = localStorage.getItem('userLoggedIn');
    // If user is not logged, every private route will return to loging page
    return (
        <Route {...props} render={(props) : ReactElement => (
            userLoggedIn ? <FunctionComponent {...props} /> : <Redirect to={ROUTES.LOGIN} />
        )} />
    );
};
