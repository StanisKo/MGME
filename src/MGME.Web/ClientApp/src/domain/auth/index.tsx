import React, { ReactElement, useState } from 'react';

import { MODE, modeNames } from './helpers';

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

    const handleModeChange = (): void => {
        setMode(mode === MODE.SIGN_UP ? MODE.SIGN_IN : MODE.SIGN_UP);
    };

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
                            variant="outlined"
                            required
                            fullWidth
                            id="username"
                            label="Username"
                            name="username"
                            autoComplete="username"
                        />
                    </Grid>
                    {mode === MODE.SIGN_UP && (
                        <Grid item xs={12}>
                            <TextField
                                variant="outlined"
                                required
                                fullWidth
                                id="email"
                                label="Email Address"
                                name="email"
                                autoComplete="email"
                            />
                        </Grid>
                    )}
                    <Grid item xs={12}>
                        <TextField
                            variant="outlined"
                            required
                            fullWidth
                            name="password"
                            label="Password"
                            type="password"
                            id="password"
                            autoComplete="password"
                        />
                    </Grid>
                </Grid>
                <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    color="primary"
                    className={submit}
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
