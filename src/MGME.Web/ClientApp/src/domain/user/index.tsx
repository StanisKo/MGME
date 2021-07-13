import { ReactElement, useEffect, useState, ChangeEvent, SyntheticEvent } from 'react';

import { useSelector, useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';

import { ApplicationState, LogoutUser } from '../../store';

import { User } from './interfaces';

import { getUser, updateUser, changePassword, deleteUser } from './requests';

import { BaseServiceResponse } from '../../shared/interfaces';
import { Alert } from '../../shared/components';
import { ROUTES, INPUT_TYPE } from '../../shared/const';
import { validEmailFormat, validPasswordFormat } from '../../shared/helpers';

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
    outlinedDeleteButton: {
        borderColor: '#bf7c7c',
        '&:hover': {
            borderColor: '#b52828'
        },
        color: '#b52828'
    },
    containedDeleteButton: {
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

                if (normalizedInput === user?.name) {
                    setNameError(true);
                    setNameHelperText('Username cannot be the same as old username');

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

                if (normalizedInput === user?.email) {
                    setEmailError(true);
                    setEmailHelperText('Email cannot be the same as old email');

                    break;
                }

                setEmail(normalizedInput);

                setEmailError(false);
                setEmailHelperText('');

                break;

            // For passwords we use pure argument, since user might include whitespaces
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

                setOldPassword(value);

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

                setNewPassword(value);

                setNewPasswordError(false);
                setNewPasswordHelperText('');

                break;

            case INPUT_TYPE.CONFRIM_PASSWORD:
                if (value !== newPassword) {
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

    const handleUserUpdate = async (): Promise<void> => {
        // Condition if user wants to update only one field
        const params: { [key: string]: string } = {
            ...(name && !nameError ? { name: name } : null),
            ...(email && !emailError ? { email: email } : null)
        };

        const response = await updateUser(params);

        setUserUpdateResponse(response);
        setUserUpdateOpenSnackbar(true);

        if (response.success) {
            setEditing(false);
        }
    };

    const handleChangePassword = async (): Promise<void> => {
        const response = await changePassword({ oldPassword, newPassword, confirmPassword });

        setChangePasswordResponse(response);
        setChangePasswordOpenSnackbar(true);

        if (response.success) {
            setEditing(false);
        }
    };

    const handleUpdate = async (): Promise<void> => {
        if ((name && !nameError && name !== user?.name) || (email && !emailError && email !== user?.email)) {
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
            dispatch<LogoutUser>(
                {
                    type: 'LOGOUT_USER'
                }
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

    const {
        root,
        centered,
        outlinedDeleteButton,
        containedDeleteButton,
        oneThirdWidth,
        toRight,
        editIcon,
        input
    } = useStyles();

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
                                variant="outlined"
                                color="primary"
                                onClick={handleUpdate}
                                disabled={!canUpdate}
                            >
                                Update
                            </Button>
                        </Grid>
                        <Grid item>
                            <Button
                                variant="outlined"
                                className={outlinedDeleteButton}
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
                        This action is irreversible, your account will be deleted forever
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDialogClose} variant="contained" color="secondary">
                        Back
                    </Button>
                    <Button onClick={handleDelete} variant="contained" className={containedDeleteButton}>
                        Yes
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    ) : null;
};
