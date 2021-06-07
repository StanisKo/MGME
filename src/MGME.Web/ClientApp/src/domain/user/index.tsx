import {
    ReactElement,
    useEffect,
    useState,
    ChangeEvent,
    Dispatch,
    SetStateAction,
    SyntheticEvent
} from 'react';

import { useSelector, useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';

import { User } from './interfaces';
import { ApplicationState } from '../../store';

import { getUser, updateUser, changePassword, deleteUser } from './requests';

import { Alert } from '../../shared/components';
import { ROUTES, INPUT_TYPE } from '../../shared/const';
import { BaseServiceResponse } from '../../shared/interfaces';
import { validEmailFormat, validPasswordFormat } from '../../shared/helpers';

import { actionCreators } from '../../store/reducers/auth';

import {
    Button,
    Paper,
    Grid,
    Typography,
    TextField,
    IconButton,
    Snackbar,
    Dialog,
    DialogContent,
    DialogContentText,
    DialogTitle,
    DialogActions
} from '@material-ui/core';

import { makeStyles } from '@material-ui/core/styles';

import EditIcon from '@material-ui/icons/Edit';
import CloseIcon from '@material-ui/icons/Close';

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
    const history = useHistory();

    const dispatch = useDispatch();

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

    const [oldPassword, setOldPassword] = useState<string>('');
    const [oldPasswordError, setOldPasswordError] = useState<boolean>(false);
    const [oldPasswordHelperText, setOldPasswordHelperText]= useState<string>('');

    const [newPassword, setNewPassword] = useState<string>('');
    const [newPasswordError, setNewPasswordError] = useState<boolean>(false);
    const [newPasswordHelperText, setNewPasswordHelperText]= useState<string>('');

    const [confirmPassword, setConfirmPassword] = useState<string>('');
    const [confirmPasswordError, setConfirmPasswordError] = useState<boolean>(false);
    const [confirmPasswordHelperText, setConfirmPasswordHelperText] = useState<string>('');

    const [userUpdateResponse, setUserUpdateResponse] = useState<BaseServiceResponse>(
        {} as BaseServiceResponse
    );

    const [changePasswordResponse, setChangePasswordResponse] = useState<BaseServiceResponse>(
        {} as BaseServiceResponse
    );

    const [openUserUpdateSnackbar, setUserUpdateOpenSnackbar] = useState<boolean>(false);
    const [openChangePasswordSnackbar, setChangePasswordOpenSnackbar] = useState<boolean>(false);

    const [dialogOpen, setDialogOpen] = useState(false);

    const inputTypeToCallback: { [key: number]: Dispatch<SetStateAction<string>> } = {
        [INPUT_TYPE.USERNAME]: setName,
        [INPUT_TYPE.EMAIL]: setEmail,
        [INPUT_TYPE.OLD_PASSWORD]: setOldPassword,
        [INPUT_TYPE.PASSWORD]: setNewPassword,
        [INPUT_TYPE.CONFRIM_PASSWORD]: setConfirmPassword
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

            case INPUT_TYPE.OLD_PASSWORD:
                if (!validPasswordFormat.test(value)) {
                    setOldPasswordError(true);
                    setOldPasswordHelperText(
                        `
                            Password must be at least 8 characters long,
                            and contain one upper-case, one lower-case letter, and one number
                        `
                    );

                    break;
                }

                setOldPasswordError(false);
                setOldPasswordHelperText('');

                break;

            case INPUT_TYPE.PASSWORD:
                if (!validPasswordFormat.test(value)) {
                    setNewPasswordError(true);
                    setNewPasswordHelperText(
                        `
                            Password must be at least 8 characters long,
                            and contain one upper-case, one lower-case letter, and one number
                        `
                    );

                    break;
                }

                setNewPasswordError(false);
                setNewPasswordHelperText('');

                break;

            case INPUT_TYPE.CONFRIM_PASSWORD:
                if (value !== newPassword) {
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

    const handleUserUpdate = async (): Promise<void | BaseServiceResponse> => {
        const params: { [key: string]: string } = {
            ...(name && !nameError ? { name: name } : null),
            ...(email && !emailError ? { email: email } : null)
        };

        const response = await updateUser(params);

        if (response) {
            setUserUpdateResponse(response);
        }

        setEditing(false);
        setUserUpdateOpenSnackbar(true);
    };

    const handleChangePassword = async (): Promise<void | BaseServiceResponse> => {
        const response = await changePassword({ oldPassword, newPassword, confirmPassword });

        if (response) {
            setChangePasswordResponse(response);
        }

        setEditing(false);
        setChangePasswordOpenSnackbar(true);
    };

    const handleUpdate = async (): Promise<void> => {
        if (user || email) {
            await handleUserUpdate();
        }

        if (oldPassword && newPassword && confirmPassword) {
            await handleChangePassword();
        }
    };

    const handleEditing = (): void => {
        setEditing(!editing);
    };

    const handleUserUpdateSnackbarClose = (event?: SyntheticEvent, reason?: string): void => {
        if (reason === 'clickaway') {
            return;
        }

        setUserUpdateOpenSnackbar(false);
    };

    const handleChangePasswordSnackbarClose = (event?: SyntheticEvent, reason?: string): void => {
        if (reason === 'clickaway') {
            return;
        }

        setChangePasswordOpenSnackbar(false);
    };

    const handleDialogOpen = (): void => {
        setDialogOpen(true);
    };
    
    const handleDialogClose = (): void => {
        setDialogOpen(false);
    };

    const handleDelete = async (): Promise<void> => {
        const response = await deleteUser() as BaseServiceResponse;

        if (response.success) {
            handleDialogClose();

            localStorage.removeItem('userLoggedIn');
            localStorage.removeItem('userRegisteredBefore');

            // We also clear out store since menu render depends on it
            dispatch(
                actionCreators.logoutUser(
                    {
                        type: 'LOGOUT_USER'
                    }
                )
            );

            history.push(ROUTES.LOGIN);
        }
    };


    useEffect(() => {
        (async (): Promise<void> => {
            if (isAuthorized && user === null) {
                await getUser();
            }
        })();
    }, [isAuthorized, user]);

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

            setOldPasswordError(false);
            setOldPasswordHelperText('');

            setNewPasswordError(false);
            setNewPasswordHelperText('');

            setConfirmPasswordError(false);
            setConfirmPasswordHelperText('');
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

        setCanUpdate(false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [email, emailError]);

    useEffect(() => {
        const allPasswordInputsAreValid =
            oldPassword
            && !oldPasswordError
            && newPassword
            && !newPasswordError
            && confirmPassword
            && !confirmPasswordError
            && newPassword === confirmPassword;

        if (allPasswordInputsAreValid) {
            setCanUpdate(true);

            return;
        }

        setCanUpdate(false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [oldPassword, oldPasswordError, newPassword, newPasswordError, confirmPassword, confirmPasswordError]);

    const { root, centered, deleteButton, oneThirdWidth, toRight, editIcon, input } = useStyles();

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
                                    inputProps={{inputtype: INPUT_TYPE.USERNAME }}
                                    className={root}
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
                                    className={root}
                                />
                            </Grid>
                            <Grid item>
                                <TextField
                                    error={oldPasswordError}
                                    helperText={oldPasswordHelperText}
                                    fullWidth
                                    variant="outlined"
                                    label="Old Password"
                                    disabled={!editing}
                                    onChange={handleInputChange}
                                    type="password"
                                    inputProps={{
                                        autoComplete: 'new-password',
                                        className: input,
                                        inputtype: INPUT_TYPE.OLD_PASSWORD
                                    }}
                                    className={root}
                                />
                            </Grid>
                            <Grid item>
                                <TextField
                                    error={newPasswordError}
                                    helperText={newPasswordHelperText}
                                    fullWidth
                                    variant="outlined"
                                    label="New Password"
                                    disabled={!editing}
                                    onChange={handleInputChange}
                                    type="password"
                                    inputProps={{
                                        autoComplete: 'new-password',
                                        className: input,
                                        inputtype: INPUT_TYPE.PASSWORD
                                    }}
                                    className={root}
                                />
                            </Grid>
                            <Grid item>
                                <TextField
                                    error={confirmPasswordError}
                                    helperText={confirmPasswordHelperText}
                                    fullWidth
                                    variant="outlined"
                                    label="Confirm New Password"
                                    disabled={!editing}
                                    onChange={handleInputChange}
                                    type="password"
                                    inputProps={{
                                        autoComplete: 'new-password',
                                        className: input,
                                        inputtype: INPUT_TYPE.CONFRIM_PASSWORD
                                    }}
                                    className={root}
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
                            <Button
                                variant="contained"
                                className={deleteButton}
                                onClick={handleDialogOpen}
                            >
                                Delete
                            </Button>
                        </Grid>
                    </Grid>
                </Grid>
            </Paper>
            <Snackbar open={openUserUpdateSnackbar} onClose={handleUserUpdateSnackbarClose}>
                <Alert
                    onClose={handleUserUpdateSnackbarClose}
                    severity={userUpdateResponse.success ? 'success' : 'warning'}>
                    {userUpdateResponse.message}
                </Alert>
            </Snackbar>
            <Snackbar open={openChangePasswordSnackbar} onClose={handleChangePasswordSnackbarClose}>
                <Alert
                    onClose={handleChangePasswordSnackbarClose}
                    severity={changePasswordResponse.success ? 'success' : 'warning'}>
                    {changePasswordResponse.message}
                </Alert>
            </Snackbar>
            <Dialog
                open={dialogOpen}
                onClose={handleDialogClose}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">{'Are you sure you want to delete your account?'}</DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        This action is irreversable, your account will be deleted forever
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDialogClose} variant="contained" color="secondary">
                        Back
                    </Button>
                    <Button onClick={handleDelete} variant="contained" className={deleteButton}>
                        Yes
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    ) : null;
};
