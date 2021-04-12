import { ReactElement, useEffect, useState, ChangeEvent, FocusEvent, Dispatch, SetStateAction } from 'react';
import { useSelector } from 'react-redux';

import { User } from './interfaces';
import { ApplicationState } from '../../store';

import { getUser, updateUser } from './requests';

import { INPUT_TYPE } from '../../shared/helpers';

import { Button, Paper, Grid, Typography, TextField, IconButton } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

import EditIcon from '@material-ui/icons/Edit';
import CloseIcon from '@material-ui/icons/Close';

const useStyles = makeStyles((theme) => ({
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
    quarterWidth: {
        width: '25%'
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

    const [canUpdate, setCanUpdate] = useState<boolean>(false);

    const [name, setName] = useState<string>('');
    const [nameError, setNameError] = useState<boolean>(false);
    const [nameHelperText, setNameHelperText] = useState<string>('');

    const [editing, setEditing] = useState<boolean>(false);

    const inputTypeToCallback: { [key: number]: Dispatch<SetStateAction<string>> } = {
        [INPUT_TYPE.USERNAME]: setName
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

                if (name === user?.name) {
                    setNameError(true);
                    setNameHelperText('Username cannot be the same as old username');

                    break;
                }

                setNameError(false);
                setNameHelperText('');

                break;

            default:
                break;
        }
    };

    const handleUpdate = async (): Promise<void> => {
        await updateUser('Stanislavskiy');
    };

    const handleEditing = (): void => {
        setEditing(!editing);
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
            setName(user.name);
            setNameError(false);
            setNameHelperText('');
        }
    }, [user, editing]);

    useEffect(() => {
        // We also double check if name does not equal previous name to handle inital render
        if (name && !nameError && name !== user?.name) {
            setCanUpdate(true);

            return;
        }

        setCanUpdate(false);
    }, [user, name, nameError]);

    const { centered, deleteButton, quarterWidth, toRight, editIcon, input } = useStyles();

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

                    <Grid item container xs={11} sm={11} lg={11} direction="column" spacing={4}>
                        <Grid item>
                            <TextField
                                error={nameError}
                                helperText={nameHelperText}
                                className={quarterWidth}
                                variant="outlined"
                                defaultValue={`${user.name}`}
                                label="Username"
                                disabled={!editing}
                                onChange={handleInputChange}
                                onBlur={handleInputValidation}
                                inputProps={{ inputtype: INPUT_TYPE.USERNAME }}
                            />
                        </Grid>
                        <Grid item>
                            <TextField
                                className={quarterWidth}
                                variant="outlined"
                                defaultValue={`${user.email}`}
                                label="Email Address"
                                disabled={!editing}
                            />
                        </Grid>
                        <Grid item>
                            <TextField
                                className={quarterWidth}
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
                                className={quarterWidth}
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
                                className={quarterWidth}
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
        </div>
    ) : null;
};
