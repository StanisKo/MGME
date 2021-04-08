import { ReactElement, useEffect } from 'react';
import { useSelector } from 'react-redux';

import { User } from './interfaces';
import { ApplicationState } from '../../store';

import { getUser } from './requests';

export const UserProfile = (): ReactElement => {
    const user: User | null = useSelector((store: ApplicationState) => store.user ?? null);

    useEffect(() => {
        (async (): Promise<void> => {
            await getUser();
        })();
    }, []);

    return user ? (
        <>
            <div>{`Name: ${user.name}`}</div>
            <div>{`Email: ${user.email}`}</div>
        </>
    ) : <div>need auth</div>;
};
