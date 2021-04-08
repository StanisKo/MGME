import { ReactElement, useEffect } from 'react';
import { useSelector } from 'react-redux';

import { User } from './interfaces';
import { ApplicationState } from '../../store';

import { getUser, updateUser } from './requests';

import { Button, Paper, Grid, Typography, TextField, IconButton } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import EditIcon from '@material-ui/icons/Edit';

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
    }
}));

export const UserProfile = (): ReactElement | null => {
    const user: User | null = useSelector(
        (store: ApplicationState) => store.user?.data ?? null
    );

    const isAuthorized: boolean = useSelector(
        (store: ApplicationState) => Boolean(store.auth?.token) ?? false
    );

    const handleUpdateTest = async (): Promise<void> => {
        await updateUser('Stanislavskiy');
    };

    useEffect(() => {
        (async (): Promise<void> => {
            if (isAuthorized) {
                await getUser();
            }
        })();
    }, [isAuthorized]);

    const { centered, deleteButton, quarterWidth, toRight, editIcon } = useStyles();

    return user ? (
        <div className={centered} >
            <Paper elevation={0}>
                <Grid container spacing={4}>
                    <Grid item>
                        <Typography component="h4" variant="h4">
                            User Profile
                        </Typography>
                    </Grid>
                    <Grid item container xs={11} sm={11} lg={11} direction="column" spacing={4}>
                        <Grid item>
                            <Typography component="h6" variant="h6">
                                {`Name: ${user.name}`}
                            </Typography>
                        </Grid>
                        <Grid item>
                            <Typography component="h6" variant="h6">
                                {`Email: ${user.email}`}
                            </Typography>
                        </Grid>
                        <Grid item>
                            <TextField
                                className={quarterWidth}
                                variant="outlined"
                                required
                                name="password"
                                label="Old Password"
                                type="password"
                                id="password"
                                autoComplete="password"
                                disabled
                            />
                        </Grid>
                        <Grid item>
                            <TextField
                                className={quarterWidth}
                                variant="outlined"
                                required
                                name="password"
                                label="New Password"
                                type="password"
                                id="password"
                                autoComplete="password"
                                disabled
                            />
                        </Grid>
                        <Grid item>
                            <TextField
                                className={quarterWidth}
                                variant="outlined"
                                required
                                name="password"
                                label="Confirm New Password"
                                type="password"
                                id="password"
                                autoComplete="password"
                                disabled
                            />
                        </Grid>
                    </Grid>

                    <Grid item xs={1} sm={1} lg={1} className={editIcon}>
                        <IconButton>
                            <EditIcon/>
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
