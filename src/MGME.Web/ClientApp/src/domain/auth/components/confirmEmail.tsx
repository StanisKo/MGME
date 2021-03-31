import React, { ReactElement, useState, SyntheticEvent } from 'react';

import { BaseServiceResponse } from '../../../shared/interfaces';
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

    if (token) {
        (async (): Promise<void> => {
            const confirmationResponse = await confirmEmailAddress(token as string);

            if (response.success) {
                setResponse(confirmationResponse);
            }
        })();
    }

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
