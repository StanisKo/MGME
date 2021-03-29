import { FunctionComponent, ReactElement } from 'react';
import { Route, Redirect } from 'react-router-dom';
import { useSelector } from 'react-redux';

import { ApplicationState } from '../../../store';
import { ROUTES } from '../../const';

interface Props {
    component: FunctionComponent<{ [key: string]: unknown }>;
    path: string;
}

export const PrivateRoute = ({component: FunctionComponent, ...props}: Props): ReactElement => {
    const userIsLoggedIn = useSelector(
        (store: ApplicationState) => store.auth?.token ?? null
    );

    // If user is not logged, every private route will return to loging page
    return (
        <Route {...props} render={(props) : ReactElement => (
            userIsLoggedIn ? <FunctionComponent {...props} /> : <Redirect to={ROUTES.LOGIN} />
        )} />
    );
};
