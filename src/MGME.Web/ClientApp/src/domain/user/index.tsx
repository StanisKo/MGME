import { ReactElement, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import { User } from './interfaces';
import { ApplicationState } from '../../store';

import { getUser, updateUser } from './requests';

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
        flexDirection: 'column',
        alignItems: 'flex-start',
        '& > button': {
            marginLeft: '3em',
            top: '-0.5em'
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

    const handleUpdateTest = async (): Promise<void> => {
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
                    <Grid item container xs={11} sm={11} lg={11} direction="column" spacing={4}>
                        <Grid item>
                            <TextField
                                className={quarterWidth}
                                variant="outlined"
                                defaultValue={`${user.name}`}
                                label="Username"
                                disabled={!editing}
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

                    <Grid item xs={1} sm={1} lg={1} className={editIcon} onClick={handleEditing}>
                        <IconButton>
                            {!editing ? <EditIcon/> : <CloseIcon/>}
                        </IconButton>
                    </Grid>

                    <Grid item container spacing={4} className={toRight}>
                        <Grid item>
                            <Button variant="contained" color="primary" onClick={handleUpdateTest} disabled>
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
