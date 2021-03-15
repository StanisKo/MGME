import { ReactElement, useState, useEffect } from 'react';

import { MODE, INPUT_TYPE, modeNames, validEmailFormat, validPasswordFormat } from './helpers';

import { Container, CssBaseline, Button, TextField, Grid, Box, Typography, Link } from '@material-ui/core';

import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
    paper: {
        marginTop: theme.spacing(8),
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
    },
    form: {
        width: '100%',
        marginTop: theme.spacing(3)
    },
    submit: {
        margin: theme.spacing(3, 0, 2)
    },
    pointer: {
        cursor: 'pointer'
    }
}));

export const SignIn = (): ReactElement => {
    const [mode, setMode] = useState<MODE>(MODE.SIGN_UP);

    const [inputIsValid, setInputIsValid] = useState<boolean>(false);

    const [name, setName] = useState<string>('');
    const [nameError, setNameError] = useState<boolean>(false);
    const [nameHelperText, setNameHelperText] = useState<string>('');
    
    const [email, setEmail] = useState<string>('');
    const [emailError, setEmailError] = useState<boolean>(false);
    const [emailHelperText, setEmailHelperText] = useState<string>('');

    const [password, setPassword] = useState<string>('');
    // const [repeatedPassword, setRepeatedPassword] = useState<string>('');
    const [passwordError, setPasswordError] = useState<boolean>(false);
    const [passwordHelperText, setPasswordHelperText]= useState<string>('');

    const handleModeChange = (): void => {
        setMode(mode === MODE.SIGN_UP ? MODE.SIGN_IN : MODE.SIGN_UP);
    };

    const validateInput = (input: INPUT_TYPE): void => {
        switch (input) {
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
                         and contain one upper-case, one-lower case letter, and one number
                        `
                    );

                    break;
                }

                setPasswordError(false);
                setPasswordHelperText('');

                break;

            default:
                break;
        }
    };

    useEffect(() => {
        if (!nameError && !emailError && !passwordError) {
            setInputIsValid(true);

            return;
        }

        setInputIsValid(false);
    }, [nameError, emailError, passwordError]);

    const { paper, submit, pointer } = useStyles();

    return (
        <Container component="main" maxWidth="xs">
            <CssBaseline />
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
                            onChange={(event): void => setName(event.target.value)}
                            {...(mode === MODE.SIGN_UP
                                ? { onBlur: (): void => validateInput(INPUT_TYPE.USERNAME) }
                                : null)
                            }
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
                                onChange={(event): void => setEmail(event.target.value)}
                                {...(mode === MODE.SIGN_UP
                                    ? { onBlur: (): void => validateInput(INPUT_TYPE.EMAIL) }
                                    : null)
                                }
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
                            onChange={(event): void => setPassword(event.target.value)}
                            {...(mode === MODE.SIGN_UP
                                ? { onBlur: (): void => validateInput(INPUT_TYPE.PASSWORD) }
                                : null)
                            }
                        />
                    </Grid>
                    {/* <Grid item xs={12}>
                        <TextField
                            error={passwordError}
                            helperText={passwordHelperText}
                            variant="outlined"
                            required
                            fullWidth
                            name="repeat-password"
                            label="Repeat Password"
                            type="password"
                            id="repeat-password"
                            autoComplete="repeat-password"
                            onBlur={(): void => validateInput(INPUT_TYPE.PASSWORD)}
                        />
                    </Grid> */}
                </Grid>
                <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    color="primary"
                    className={submit}
                    disabled={!inputIsValid}
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
            </div>
        </Container>
    );
};
