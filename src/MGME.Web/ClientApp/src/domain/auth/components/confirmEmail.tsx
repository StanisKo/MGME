import { ReactElement, useState, SyntheticEvent, useEffect } from 'react';
import { useHistory } from 'react-router-dom';

import { confirmEmailAddress } from '../requests';

import { ROUTES } from '../../../shared/const';
import { Alert } from '../../../shared/components/alert';
import { BaseServiceResponse } from '../../../shared/interfaces';

import { Container, Box, Typography, Snackbar, Grid, CardMedia } from '@material-ui/core';

import { makeStyles } from '@material-ui/core/styles';

import qs from 'qs';

const useStyles = makeStyles((theme) => ({
    welcomeContainer: {
        marginTop: theme.spacing(20),
        paddingTop: theme.spacing(4),
        paddingBottom: theme.spacing(10),
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: '5px'
    },
    top: {
        height: '50vh',
        backgroundColor: theme.palette.primary.main
    },
    bottom: {
        height: '50vh',
        backgroundColor: '#f4f4f4'
    },
    media: {
        marginTop: theme.spacing(2),
        width: '75%'
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
    }, [token, history]);

    const { welcomeContainer, top, media } = useStyles();

    return (
        <Grid container>
            <Grid item xs={12} sm={12} lg={12} className={top}>
                <Container component="main" maxWidth="xs" className={welcomeContainer}>
                    <Box mb={4}>
                        <Typography component="h1" variant="h4">
                            Welcome to MGME!
                        </Typography>
                    </Box>
                    <CardMedia
                        component="img"
                        src='/assets/images/confirmation.jpg'
                        className={media}
                    />
                    <Snackbar open={openSnackbar} onClose={handleSnackbarClose}>
                        <Alert onClose={handleSnackbarClose} severity={response.success ? 'success' : 'warning'}>
                            {response.success ? (
                                <a
                                    href={ROUTES.LOGIN}
                                    style={{color: 'inherit' }}
                                >
                                    {`${response.message}. You can now login`}
                                </a>
                            ) : (
                                <a
                                    href={ROUTES.LOGIN}
                                    style={{color: 'inherit' }}
                                >
                                    {`${response.message}. Go to login`}
                                </a>
                            )}
                        </Alert>
                    </Snackbar>
                </Container>
            </Grid>
            <Grid item />
        </Grid>
    );
};
