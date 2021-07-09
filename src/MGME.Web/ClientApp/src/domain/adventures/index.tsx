import { ReactElement } from 'react';

import { AdventuresTable } from './components';

import { Paper, Grid, Theme, Button } from '@material-ui/core';

import { createStyles, makeStyles } from '@material-ui/core/styles';

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

    // Rest are also shared by creation modal
    const { deleteButton, ...classes } = useStyles();

    return (
        <>
            <div className={classes.centered}>
                <Paper elevation={0}>
                    <Grid container spacing={4}>
                        <Grid item xs={6} />

                        <Grid item xs={6} container alignItems="center" justify="flex-end" className={classes.buttons}>
                            <Button
                                variant="outlined"
                                color="primary"
                                size="medium"
                                // onClick={handleDialogOpen}
                                // disabled={!nothingSelected}
                            >
                                Create
                            </Button>
                            <Button
                                variant="outlined"
                                color="primary"
                                size="medium"
                                // disabled={nothingSelected || displayAdventures || displayCharactersToAddTo}
                                className={deleteButton}
                                // onClick={handleDelete}
                            >
                                Remove
                            </Button>
                        </Grid>

                        <Grid item xs={12}>
                            <AdventuresTable />
                        </Grid>
                    </Grid>
                </Paper>
            </div>
        </>
    );
};
