import {
    ReactElement,
    useEffect,
    useState,
    ChangeEvent,
    Dispatch,
    SetStateAction,
    SyntheticEvent
} from 'react';

import { useSelector } from 'react-redux';

import { User } from './interfaces';
import { ApplicationState } from '../../store';

import { getUser, updateUser } from './requests';

import { Alert } from '../../shared/components/alert';
import { BaseServiceResponse } from '../../shared/interfaces';
import { INPUT_TYPE, validEmailFormat } from '../../shared/helpers';

import { Button, Paper, Grid, Typography, TextField, IconButton, Snackbar } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

import EditIcon from '@material-ui/icons/Edit';
import CloseIcon from '@material-ui/icons/Close';

const useStyles = makeStyles(() => ({
    deleteButton: {
        backgroundColor: '#d32f2f',
        '&:hover': {
            backgroundColor: '#b52828'
        },
        color: 'white'
    },
    centered: {
        display: 'flex',
        justifyContent: 'center'
    },
    oneThirdWidth: {
        width: '30%'
    },
    toRight: {
        display: 'flex',
        justifyContent: 'flex-end'
    },
    editIcon: {
        display: 'flex',
        flexGrow: 1,
        justifyContent: 'flex-end',
        alignItems: 'flex-end',
        '& > button': {
            top: '-0.15em'
        }
    },
    // Some voodoo never hurts: https://github.com/mui-org/material-ui/issues/14427
    input: {
        '&:-webkit-autofill': {
            transitionDelay: '9999s',
            transitionProperty: 'background-color, color'
        }
    }
}));

export const UserProfile = (): ReactElement | null => {
    const user: User | null = useSelector(
        (store: ApplicationState) => store.user?.data ?? null
    );

    const isAuthorized: boolean = useSelector(
        (store: ApplicationState) => Boolean(store.auth?.token) ?? false
    );

    const [editing, setEditing] = useState<boolean>(false);
    const [canUpdate, setCanUpdate] = useState<boolean>(false);

    const [name, setName] = useState<string>('');
    const [nameError, setNameError] = useState<boolean>(false);
    const [nameHelperText, setNameHelperText] = useState<string>('');

    const [email, setEmail] = useState<string>('');
    const [emailError, setEmailError] = useState<boolean>(false);
    const [emailHelperText, setEmailHelperText] = useState<string>('');

    const [response, setResponse] = useState<BaseServiceResponse>({} as BaseServiceResponse);

    const [openSnackbar, setOpenSnackbar] = useState<boolean>(false);

    const inputTypeToCallback: { [key: number]: Dispatch<SetStateAction<string>> } = {
        [INPUT_TYPE.USERNAME]: setName,
        [INPUT_TYPE.EMAIL]: setEmail
    };

    const handleInputChange = (event: ChangeEvent<HTMLInputElement>): void => {
        const inputType = Number(event.target.attributes.getNamedItem('inputtype')?.value);

        const value = event.target.value;

        inputTypeToCallback[inputType](value);

        handleInputValidation(inputType, value);
    };

    const handleInputValidation = (inputType: number, value: string): void => {
        switch (inputType) {
            case INPUT_TYPE.USERNAME:
                if (value.length < 6) {
                    setNameError(true);
                    setNameHelperText('Username must be at least 6 characters long');

                    break;
                }

                if (value === user?.name) {
                    setNameError(true);
                    setNameHelperText('Username cannot be the same as old username');

                    break;
                }

                setNameError(false);
                setNameHelperText('');

                break;

            case INPUT_TYPE.EMAIL:
                if (!validEmailFormat.test(value)) {
                    setEmailError(true);
                    setEmailHelperText('Email address is not valid');

                    break;
                }

                if (value === user?.email) {
                    setEmailError(true);
                    setEmailHelperText('Email cannot be the same as old email');

                    break;
                }

                setEmailError(false);
                setEmailHelperText('');

                break;

            default:
                break;
        }
    };

    const handleUpdate = async (): Promise<void> => {
        const response = await updateUser({ name: name, email: email });

        if (response) {
            setResponse(response);
        }

        setEditing(false);
        setOpenSnackbar(true);
    };

    const handleEditing = (): void => {
        setEditing(!editing);
    };

    const handleSnackbarClose = (event?: SyntheticEvent, reason?: string): void => {
        if (reason === 'clickaway') {
            return;
        }

        setOpenSnackbar(false);
    };

    useEffect(() => {
        (async (): Promise<void> => {
            if (isAuthorized) {
                await getUser();
            }
        })();
    }, [isAuthorized]);

    useEffect(() => {
        if (user !== null) {
            setName(user.name);
        }
    }, [user]);

    useEffect(() => {
        if (!editing && user !== null) {
            setCanUpdate(false);

            setName(user.name);
            setNameError(false);
            setNameHelperText('');

            setEmail(user.email);
            setEmailError(false);
            setEmailHelperText('');
        }
    // Explicitly done to avoid unnecessary re-renders
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [editing]);

    useEffect(() => {
        // We also double check if name does not equal previous name to handle inital render
        if (name && !nameError && name !== user?.name) {
            setCanUpdate(true);

            return;
        }

        setCanUpdate(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [name, nameError]);

    /*
    Since we want to allow seperate updates, we have separate callbacks for different fields
    We also double check if email does not equal previous email to handle inital render
    */
    useEffect(() => {
        if (email && !emailError && email !== user?.email) {
            setCanUpdate(true);

            return;
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [email, emailError]);

    const { centered, deleteButton, oneThirdWidth, toRight, editIcon, input } = useStyles();

    return user ? (
        <div className={centered}>
            <Paper elevation={0}>
                <Grid container spacing={4}>
                    <Grid item>
                        <Typography component="h4" variant="h4">
                            User Profile
                        </Typography>
                    </Grid>

                    <Grid item className={editIcon} onClick={handleEditing}>
                        <IconButton>
                            {!editing ? <EditIcon/> : <CloseIcon/>}
                        </IconButton>
                    </Grid>

                    <Grid item xs={11} sm={11} lg={11}>
                        <Grid
                            item
                            container
                            direction="column"
                            spacing={4}
                            className={oneThirdWidth}
                        >
                            <Grid item>
                                <TextField
                                    error={nameError}
                                    helperText={nameHelperText}
                                    fullWidth
                                    variant="outlined"
                                    defaultValue={`${user.name}`}
                                    label="Username"
                                    disabled={!editing}
                                    onChange={handleInputChange}
                                    inputProps={{ inputtype: INPUT_TYPE.USERNAME }}
                                />
                            </Grid>
                            <Grid item>
                                <TextField
                                    error={emailError}
                                    helperText={emailHelperText}
                                    fullWidth
                                    variant="outlined"
                                    defaultValue={`${user.email}`}
                                    label="Email Address"
                                    disabled={!editing}
                                    onChange={handleInputChange}
                                    inputProps={{ inputtype: INPUT_TYPE.EMAIL }}
                                />
                            </Grid>
                            <Grid item>
                                <TextField
                                    fullWidth
                                    variant="outlined"
                                    label="Old Password"
                                    disabled={!editing}
                                    type="password"
                                    inputProps={{
                                        autoComplete: 'new-password',
                                        className: input
                                    }}
                                />
                            </Grid>
                            <Grid item>
                                <TextField
                                    fullWidth
                                    variant="outlined"
                                    label="New Password"
                                    disabled={!editing}
                                    type="password"
                                    inputProps={{
                                        autoComplete: 'new-password',
                                        className: input
                                    }}
                                />
                            </Grid>
                            <Grid item>
                                <TextField
                                    fullWidth
                                    variant="outlined"
                                    label="Confirm New Password"
                                    disabled={!editing}
                                    type="password"
                                    inputProps={{
                                        autoComplete: 'new-password',
                                        className: input
                                    }}
                                />
                            </Grid>
                        </Grid>
                    </Grid>

                    <Grid item container spacing={4} className={toRight}>
                        <Grid item>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={handleUpdate}
                                disabled={!canUpdate}
                            >
                                Update
                            </Button>
                        </Grid>
                        <Grid item>
                            <Button variant="contained" className={deleteButton}>
                                Delete
                            </Button>
                        </Grid>
                    </Grid>
                </Grid>
            </Paper>
            <Snackbar open={openSnackbar} onClose={handleSnackbarClose}>
                <Alert onClose={handleSnackbarClose} severity={response.success ? 'success' : 'warning'}>
                    {response.message}
                </Alert>
            </Snackbar>
        </div>
    ) : null;
};
