import { ReactElement, useState, SyntheticEvent } from 'react';
import { useSelector } from 'react-redux';

import { ApplicationState } from '../../store';

import { AdventuresTable, CreateAdventureModal } from './components';

import { BaseServiceResponse } from '../../shared/interfaces';

import { Paper, Grid, Theme, Button, Snackbar } from '@material-ui/core';

import { createStyles, makeStyles } from '@material-ui/core/styles';

import { Alert } from '../../shared/components';
import { TABLE_DISPLAY_MODE } from '../../shared/const';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
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
        centered: {
            display: 'flex',
            justifyContent: 'center'
        },
        formControl: {
            minWidth: 220
        },
        buttons: {
            '& button': {
                margin: '0 .5em 0 .5em'
            }
        },
        deleteButton: {
            borderColor: '#bf7c7c',
            '&:hover': {
                borderColor: '#b52828'
            },
            color: '#b52828'
        }
    })
);

export const Adventures = (): ReactElement => {
    const selectedAdventures = useSelector(
        (store: ApplicationState) => store.adventures?.dataset?.selected ?? []
    );

    const [dialogOpen, setDialogOpen] = useState<boolean>(false);

    const [openSnackbar, setOpenSnackbar] = useState<boolean>(false);

    const [response, setResponse] = useState<BaseServiceResponse>({} as BaseServiceResponse);

    const handleDialogOpen = (): void => {
        setDialogOpen(true);
    };

    const handleDialogClose = (): void => {
        setDialogOpen(false);
    };

    const handleSnackbarClose = (event?: SyntheticEvent, reason?: string): void => {
        if (reason === 'clickaway') {
            return;
        }

        setOpenSnackbar(false);
    };

    const nothingSelected = selectedAdventures?.length === 0;

    // Rest are also shared by creation modal
    const { deleteButton, ...classes } = useStyles();

    return (
        <>
            <div className={classes.centered}>
                <Paper elevation={0}>
                    <Grid container spacing={4}>
                        <Grid item xs={6} />

                        <Grid
                            item xs={6}
                            container
                            alignItems="center"
                            justifyContent="flex-end"
                            className={classes.buttons}
                        >
                            <Button
                                variant="outlined"
                                color="primary"
                                size="medium"
                                onClick={handleDialogOpen}
                                disabled={!nothingSelected}
                            >
                                Create
                            </Button>
                            <Button
                                variant="outlined"
                                color="primary"
                                size="medium"
                                disabled={nothingSelected}
                                className={deleteButton}
                            >
                                Remove
                            </Button>
                        </Grid>

                        <Grid item xs={12}>
                            <AdventuresTable mode={TABLE_DISPLAY_MODE.TO_SHOW} />
                        </Grid>
                    </Grid>
                </Paper>
            </div>

            {dialogOpen && (
                <CreateAdventureModal
                    handleDialogClose={handleDialogClose}
                    classes={classes as unknown as { [key: string]: string }}
                    setResponse={setResponse}
                    setOpenSnackBar={setOpenSnackbar}
                />
            )}

            <Snackbar open={openSnackbar} onClose={handleSnackbarClose}>
                <Alert
                    onClose={handleSnackbarClose}
                    severity={response.success ? 'success' : 'warning'}
                >
                    {response.message}
                </Alert>
            </Snackbar>
        </>
    );
};
