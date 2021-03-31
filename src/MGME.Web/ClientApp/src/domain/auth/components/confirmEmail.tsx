import { ReactElement, useState, SyntheticEvent, useEffect } from 'react';

import { BaseServiceResponse } from '../../../shared/interfaces';
import { history } from '../../../shared/utils';
import { ROUTES } from '../../../shared/const';
import { confirmEmailAddress } from '../requests';

import { Snackbar } from '@material-ui/core';
import { Alert } from '@material-ui/lab';

import qs from 'qs';

export const ConfirmEmail = (): ReactElement => {
    const token = qs.parse(window.location.search, { ignoreQueryPrefix: true })?.token;

    const [response, setResponse] = useState<BaseServiceResponse>(
        {} as BaseServiceResponse
    );

    const [openSnackbar, setOpenSnackbar] = useState<boolean>(false);

    const handleSnackbarClose = (event?: SyntheticEvent, reason?: string): void => {
        if (reason === 'clickaway') {
            return;
        }

        setOpenSnackbar(false);
    };

    useEffect(() => {
        if (token) {
            (async (): Promise<void> => {
                const confirmationResponse = await confirmEmailAddress(token as string);

                setResponse(confirmationResponse);
                setOpenSnackbar(true);
            })();
        }
        else {
            // Otherwise user is logged out and attempting to access the route without token
            history.push(ROUTES.LOGIN);
        }
    }, [token]);

    return (
        <>
            <div>Thank you for confirming email address</div>
            <Snackbar open={openSnackbar} onClose={handleSnackbarClose}>
                <Alert onClose={handleSnackbarClose} severity={response.success ? 'success' : 'warning'}>
                    {response.message}
                </Alert>
            </Snackbar>
        </>
    );
};
