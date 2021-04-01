import { ReactElement, useState, SyntheticEvent, useEffect } from 'react';
import { useHistory } from 'react-router-dom';

import { confirmEmailAddress } from '../requests';

import { ROUTES } from '../../../shared/const';
import { Alert } from '../../../shared/components/alert';
import { BaseServiceResponse } from '../../../shared/interfaces';

import { Container, Box, Typography, Snackbar } from '@material-ui/core';

import { makeStyles } from '@material-ui/core/styles';

import qs from 'qs';

const useStyles = makeStyles((theme) => ({
    paper: {
        marginTop: theme.spacing(8),
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
    }
}));


export const ConfirmEmail = (): ReactElement => {
    const history = useHistory();

    const token = qs.parse(history.location.search, { ignoreQueryPrefix: true })?.token;

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

    const { paper } = useStyles();

    return (
        <Container component="main" maxWidth="xs">
            <div className={paper}>
                <Box mb={4}>
                    <Typography component="h1" variant="h5">
                        Welcome!
                    </Typography>
                </Box>
                <Snackbar open={openSnackbar} onClose={handleSnackbarClose}>
                    <Alert onClose={handleSnackbarClose} severity={response.success ? 'success' : 'warning'}>
                        {response.success ? (
                            <a
                                href={ROUTES.LOGIN}
                                style={{color: 'inherit' }}
                            >
                                {`${response.message}. You can now login`}
                            </a>
                        ) : response.message}
                    </Alert>
                </Snackbar>
            </div>
        </Container>
    );
};
