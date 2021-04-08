import { ReactElement, useEffect } from 'react';
import { useSelector } from 'react-redux';

import { User } from './interfaces';
import { ApplicationState } from '../../store';

import { getUser, updateUser } from './requests';

import { Button, Paper } from '@material-ui/core';

export const UserProfile = (): ReactElement | null => {
    const user: User | null = useSelector(
        (store: ApplicationState) => store.user?.data ?? null
    );

    const isAuthorized: boolean = useSelector(
        (store: ApplicationState) => Boolean(store.auth?.token) ?? false
    );

    const handleUpdateTest = async (): Promise<void> => {
        await updateUser('Stanislavskiy');
    };

    useEffect(() => {
        (async (): Promise<void> => {
            if (isAuthorized) {
                await getUser();
            }
        })();
    }, [isAuthorized]);

    return user ? (
        <>
            <div>{`Name: ${user.name}`}</div>
            <div>{`Email: ${user.email}`}</div>
            <Button onClick={handleUpdateTest}>
                Update
            </Button>
            <Paper>test</Paper>
        </>
    ) : null;
};
