import { ReactElement, useState, useEffect, ChangeEvent, SyntheticEvent, Dispatch, SetStateAction } from 'react';

import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';

import { LoginUser } from '../../../store';

import { loginOrRegisterUser } from '../requests';
import { MODE, modeNames } from '../helpers';

import {
    BaseServiceResponse,
    DataServiceResponse,
    UserTokenResponse,
    DecodedToken
} from '../../../shared/interfaces';

import { Alert } from '../../../shared/components';
import { INPUT_TYPE, ROUTES } from '../../../shared/const';
import { validEmailFormat, validPasswordFormat } from '../../../shared/helpers';


import { Container, Button, TextField, Grid, Box, Typography, Link, Snackbar } from '@material-ui/core';

import jwt_decode from 'jwt-decode';

import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
    root: {
        '& label.Mui-error': {
            color: theme.palette.secondary.main
        },
        '& .Mui-error': {
            '& fieldset': {
                borderColor: '#077b8a !important'
            }
        },
        '& .MuiFormHelperText-root': {
            color: theme.palette.secondary.main
        }
    },
    paper: {
        marginTop: theme.spacing(8),
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
    },
    submit: {
        margin: theme.spacing(3, 0, 2)
    },
    pointer: {
        cursor: 'pointer'
    }
}));

interface Props {
    /*
    We declare indexer to allow passing props from
    several components up the hierarcy without typing them along the way
    */
    [key: string]: unknown;

    setAccessTokenExpiresIn?: Dispatch<SetStateAction<number>>;
}

export const Login = ({ setAccessTokenExpiresIn }: Props): ReactElement | null => {
    // We don't need to parse it: it's either there or not
    const userRegisteredBefore = localStorage.getItem('userRegisteredBefore');

    const history = useHistory();

    const dispatch = useDispatch();

    const [mode, setMode] = useState<MODE>(userRegisteredBefore ? MODE.SIGN_IN : MODE.SIGN_UP);

    const [canSignUp, setCanSignUp] = useState<boolean>(false);
    const [canSignIn, setCanSignIn] = useState<boolean>(false);

    const [name, setName] = useState<string>('');
    const [nameError, setNameError] = useState<boolean>(false);
    const [nameHelperText, setNameHelperText] = useState<string>('');

    const [email, setEmail] = useState<string>('');
    const [emailError, setEmailError] = useState<boolean>(false);
    const [emailHelperText, setEmailHelperText] = useState<string>('');

    const [password, setPassword] = useState<string>('');
    const [passwordError, setPasswordError] = useState<boolean>(false);
    const [passwordHelperText, setPasswordHelperText]= useState<string>('');

    const [confirmPassword, setConfirmPassword] = useState<string>('');
    const [confirmPasswordError, setConfirmPasswordError] = useState<boolean>(false);
    const [confirmPasswordHelperText, setConfirmPasswordHelperText] = useState<string>('');

    // We use the same container for result of sign up and result of sign in (that also holds JWT)
    const [response, setResponse] = useState<BaseServiceResponse | DataServiceResponse<UserTokenResponse>>(
        {} as BaseServiceResponse
    );

    const [openSnackbar, setOpenSnackbar] = useState<boolean>(false);

    const handleModeChange = (): void => {
        setMode(mode === MODE.SIGN_UP ? MODE.SIGN_IN : MODE.SIGN_UP);
    };

    const handleInputChange = (event: ChangeEvent<HTMLInputElement>): void => {
        const inputType = Number(event.target.attributes.getNamedItem('inputtype')?.value);

        const value = event.target.value;

        handleInputValidation(inputType, value);
    };

    const handleInputValidation = (inputType: number, value: string): void => {
        const normalizedInput = value.trim();

        switch (inputType) {
            case INPUT_TYPE.USERNAME:
                if (normalizedInput.length < 6) {
                    setNameError(true);
                    setNameHelperText('Username must be at least 6 characters long');

                    break;
                }

                setName(normalizedInput);

                setNameError(false);
                setNameHelperText('');

                break;

            case INPUT_TYPE.EMAIL:
                if (!validEmailFormat.test(normalizedInput)) {
                    setEmailError(true);
                    setEmailHelperText('Email address is not valid');

                    break;
                }

                setEmail(normalizedInput);

                setEmailError(false);
                setEmailHelperText('');

                break;

            // For passwords we use pure argument, since user might include whitespaces
            case INPUT_TYPE.PASSWORD:
                if (mode === MODE.SIGN_IN) {
                    setPassword(value);

                    break;
                }

                if (!validPasswordFormat.test(value)) {
                    setPasswordError(true);
                    setPasswordHelperText(
                        `
                         Password must be at least 8 characters long,
                         and contain one upper-case, one lower-case letter, and one number
                        `
                    );

                    break;
                }

                setPassword(value);

                setPasswordError(false);
                setPasswordHelperText('');

                break;

            case INPUT_TYPE.CONFRIM_PASSWORD:
                if (value !== password) {
                    setConfirmPasswordError(true);
                    setConfirmPasswordHelperText('Passwords don\'t match');

                    break;
                }

                setConfirmPassword(value);

                setConfirmPasswordError(false);
                setConfirmPasswordHelperText('');

                break;

            default:
                break;
        }
    };

    const handleRequest = async (): Promise<void> => {
        const authResponse = await loginOrRegisterUser(
            mode,
            {
                name: name,
                ...(mode === MODE.SIGN_UP ? { email: email } : null),
                password: password,
                ...(mode === MODE.SIGN_UP ? { confirmPassword: confirmPassword } : null)
            }
        );

        setResponse(authResponse);
        setOpenSnackbar(true);

        if (authResponse.success) {

            if (!userRegisteredBefore) {
                /*
                If no value in storage, be it sign in or sign up, we set it there
                (also helps if they clear cookies or use different machine)
                */
                localStorage.setItem('userRegisteredBefore', JSON.stringify(true));
            }

            if (mode === MODE.SIGN_IN) {
                localStorage.setItem('userLoggedIn', JSON.stringify(true));

                const token = (authResponse as DataServiceResponse<UserTokenResponse>).data.accessToken;

                const decoded = jwt_decode(token) as DecodedToken;

                dispatch<LoginUser>(
                    {
                        type: 'LOGIN_USER',
                        payload: {
                            token: token,
                            userRole: decoded.role
                        }
                    }
                );

                /*
                We set access token expiration, so the parent component (Application)
                Can start the deferred refresh function
                */
                if (setAccessTokenExpiresIn) {
                    setAccessTokenExpiresIn(
                        (decoded.exp - decoded.iat) * 1000 * 0.8
                    );
                }

                history.push(ROUTES.CATALOGUES);

                return;
            }

            setMode(MODE.SIGN_IN);
        }
    };

    const handleSnackbarClose = (event?: SyntheticEvent, reason?: string): void => {
        if (reason === 'clickaway') {
            return;
        }

        setOpenSnackbar(false);
    };

    useEffect(() => {
        const allInputsArePresent =
            name
            && email
            && password
            && confirmPassword;

        const allInputsAreValid =
            !nameError
            && !emailError
            && !passwordError
            && !confirmPasswordError;

        /*
        We also check for repeat password length on change to avoid activating button
        during input (validation handler is triggered only on blur)
        */
        if (allInputsArePresent && allInputsAreValid && confirmPassword.length >= 8) {
            setCanSignUp(true);
        }
        else if (name && password && !nameError && !passwordError && password.length >= 8) {
            setCanSignIn(true);
        }
        else {
            setCanSignUp(false);
            setCanSignIn(false);
        }
    }, [name, email, password, confirmPassword, nameError, emailError, passwordError, confirmPasswordError]);

    useEffect(() => {
        if (mode === MODE.SIGN_IN) {
            setNameError(false);
            setPasswordError(false);

            setNameHelperText('');
            setPasswordHelperText('');
        }
        else {
            setCanSignUp(false);
        }
    }, [mode]);

    const { root, paper, submit, pointer } = useStyles();

    // We wait for the handler to be in scope
    return setAccessTokenExpiresIn ? (
        <Container component="main" maxWidth="xs">
            <div className={paper}>
                <Box mb={4}>
                    <Typography component="h1" variant="h5">
                        {modeNames[mode]}
                    </Typography>
                </Box>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <TextField
                            error={nameError}
                            helperText={nameHelperText}
                            variant="outlined"
                            required
                            fullWidth
                            id="username"
                            label="Username"
                            name="username"
                            autoComplete="username"
                            inputProps={{ inputtype: INPUT_TYPE.USERNAME }}
                            onChange={handleInputChange}
                            className={root}
                        />
                    </Grid>
                    {mode === MODE.SIGN_UP && (
                        <Grid item xs={12}>
                            <TextField
                                error={emailError}
                                helperText={emailHelperText}
                                variant="outlined"
                                required
                                fullWidth
                                id="email"
                                label="Email Address"
                                name="email"
                                autoComplete="email"
                                inputProps={{ inputtype: INPUT_TYPE.EMAIL }}
                                onChange={handleInputChange}
                                className={root}
                            />
                        </Grid>
                    )}
                    <Grid item xs={12}>
                        <TextField
                            error={passwordError}
                            helperText={passwordHelperText}
                            variant="outlined"
                            required
                            fullWidth
                            name="password"
                            label="Password"
                            type="password"
                            id="password"
                            autoComplete="password"
                            inputProps={{ inputtype: INPUT_TYPE.PASSWORD }}
                            onChange={handleInputChange}
                            className={root}
                        />
                    </Grid>
                    {mode === MODE.SIGN_UP && (
                        <Grid item xs={12}>
                            <TextField
                                error={confirmPasswordError}
                                helperText={confirmPasswordHelperText}
                                variant="outlined"
                                required
                                fullWidth
                                name="confirm-password"
                                label="Confirm Password"
                                type="password"
                                id="confirm-password"
                                autoComplete="confirm-password"
                                inputProps={{ inputtype: INPUT_TYPE.CONFRIM_PASSWORD }}
                                onChange={handleInputChange}
                                className={root}
                            />
                        </Grid>
                    )}
                </Grid>
                <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    color="primary"
                    className={submit}
                    disabled={mode === MODE.SIGN_UP ? !canSignUp : !canSignIn}
                    onClick={handleRequest}
                >
                    {modeNames[mode]}
                </Button>
                <Grid container justify="flex-end">
                    <Grid item>
                        <Link variant="body2" color="secondary" className={pointer} onClick={handleModeChange}>
                            {mode === MODE.SIGN_UP
                                ? 'Already have an account? Sign in'
                                : 'Don\'t have an account? Sign up'}
                        </Link>
                    </Grid>
                </Grid>
                <Snackbar open={openSnackbar} onClose={handleSnackbarClose}>
                    <Alert onClose={handleSnackbarClose} severity={response.success ? 'success' : 'warning'}>
                        {response.message}
                    </Alert>
                </Snackbar>
            </div>
        </Container>
    ) : null;
};
