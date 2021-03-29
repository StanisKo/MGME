import {
    ReactElement,
    useState,
    useEffect,
    ChangeEvent,
    FocusEvent,
    SyntheticEvent,
    Dispatch,
    SetStateAction
} from 'react';

import { useHistory } from 'react-router-dom';
import { useDispatch } from 'react-redux';

import { BaseServiceResponse, DataServiceResponse } from '../../../shared/interfaces';
import { UserTokenResponse, DecodedToken } from '../interfaces';

import { loginOrRegisterUser } from '../requests';
import { ROUTES } from '../../../shared/const';
import { MODE, INPUT_TYPE, modeNames, validEmailFormat, validPasswordFormat } from '../helpers';

import { actionCreators } from '../../../store/reducers/auth';

import { Container, Button, TextField, Grid, Box, Typography, Link, Snackbar } from '@material-ui/core';
import MuiAlert, { AlertProps } from '@material-ui/lab/Alert';

import jwt_decode from 'jwt-decode';

import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
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

const Alert = (props: AlertProps): ReactElement => <MuiAlert elevation={6} variant="filled" {...props} />;

export const Login = (): ReactElement => {
    // We don't need to parse it: it's either there or not
    const userRegisteredBefore = localStorage.getItem('userRegisteredBefore');

    const history = useHistory();

    const dispatch = useDispatch();

    const [mode, setMode] = useState<MODE>(userRegisteredBefore ? MODE.SIGN_IN : MODE.SIGN_UP);

    const [inputIsValid, setInputIsValid] = useState<boolean>(false);

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

    const inputTypeToCallback: { [key: number]: Dispatch<SetStateAction<string>> } = {
        [INPUT_TYPE.USERNAME]: setName,
        [INPUT_TYPE.EMAIL]: setEmail,
        [INPUT_TYPE.PASSWORD]: setPassword,
        [INPUT_TYPE.REPEAT_PASSWORD]: setConfirmPassword
    };

    const handleModeChange = (): void => {
        setMode(mode === MODE.SIGN_UP ? MODE.SIGN_IN : MODE.SIGN_UP);
    };

    const handleInputChange = (event: ChangeEvent<HTMLInputElement>): void => {
        const inputType = Number(event.target.attributes.getNamedItem('inputtype')?.value);

        const value = event.target.value;

        inputTypeToCallback[inputType](value);
    };

    const handleInputValidation = (event: FocusEvent<HTMLTextAreaElement | HTMLInputElement>): void => {
        const inputType = Number(event.target.attributes.getNamedItem('inputtype')?.value);

        switch (inputType) {
            case INPUT_TYPE.USERNAME:
                if (name.length < 6) {
                    setNameError(true);
                    setNameHelperText('Username must be at least 6 characters long');

                    break;
                }

                setNameError(false);
                setNameHelperText('');

                break;

            case INPUT_TYPE.EMAIL:
                if (!validEmailFormat.test(email)) {
                    setEmailError(true);
                    setEmailHelperText('Email address is not valid');

                    break;
                }

                setEmailError(false);
                setEmailHelperText('');

                break;

            case INPUT_TYPE.PASSWORD:
                if (!validPasswordFormat.test(password)) {
                    setPasswordError(true);
                    setPasswordHelperText(
                        `
                         Password must be at least 8 characters long,
                         and contain one upper-case, one lower-case letter, and one number
                        `
                    );

                    break;
                }

                setPasswordError(false);
                setPasswordHelperText('');

                break;

            case INPUT_TYPE.REPEAT_PASSWORD:
                if (confirmPassword.length < 8 && password !== confirmPassword) {
                    setConfirmPasswordError(true);
                    setConfirmPasswordHelperText('Passwords don\'t match');

                    break;
                }

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
                const token = (authResponse as DataServiceResponse<UserTokenResponse>).data.accessToken;

                const decoded = jwt_decode(token) as DecodedToken;

                dispatch(
                    actionCreators.parseUser(
                        {
                            type: 'PARSE_USER',
                            payload: {
                                token: token,
                                userId: decoded.nameid,
                                userName: decoded.unique_name,
                                userRole: decoded.role
                            }
                        }
                    )
                );

                history.push(ROUTES.START);

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
            setInputIsValid(true);

            return;
        }

        setInputIsValid(false);
    }, [name, email, password, confirmPassword, nameError, emailError, passwordError, confirmPasswordError]);

    useEffect(() => {
        if (mode === MODE.SIGN_IN) {
            setNameError(false);
            setPasswordError(false);

            setNameHelperText('');
            setPasswordHelperText('');
        }
        else {
            setInputIsValid(false);
        }
    }, [mode]);

    const { paper, submit, pointer } = useStyles();

    return (
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
                            {...(mode === MODE.SIGN_UP ? { onBlur: handleInputValidation } : null)}
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
                                onBlur={handleInputValidation}
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
                            {...(mode === MODE.SIGN_UP ? { onBlur: handleInputValidation } : null)}
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
                                inputProps={{ inputtype: INPUT_TYPE.REPEAT_PASSWORD }}
                                onChange={handleInputChange}
                                onBlur={handleInputValidation}
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
                    disabled={mode === MODE.SIGN_UP ? !inputIsValid : false}
                    onClick={handleRequest}
                >
                    {modeNames[mode]}
                </Button>
                <Grid container justify="flex-end">
                    <Grid item>
                        <Link variant="body2" className={pointer} onClick={handleModeChange}>
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
    );
};
