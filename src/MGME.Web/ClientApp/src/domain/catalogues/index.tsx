import { ReactElement, useState, ChangeEvent } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { ApplicationState, UpdateStore } from '../../store';

import { PlayerCharactersTable, CreatePlayerCharacterModal } from '../playerCharacter/components';
import { deletePlayerCharacters } from '../playerCharacter/requests';

import {
    Paper,
    Grid,
    FormControl,
    Select,
    MenuItem,
    Button,
    Theme
} from '@material-ui/core';

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

enum SELECTED_MENU {
    PLAYER_CHARACTERS = 0,
    NON_PLAYER_CHARACTERS = 1
}

/*
TODO: break down into smaller components

1. Finish with creating character logic and request
2. Move creation window into separate component
*/

export const Catalogues = (): ReactElement => {
    const dispatch = useDispatch();

    const selectedEntities = useSelector(
        (store: ApplicationState) => store.catalogues?.playerCharacters?.selected ?? []
    );

    const [selectedMenu, setSelectedMenu] = useState<number>(SELECTED_MENU.PLAYER_CHARACTERS);

    const [dialogOpen, setDialogOpen] = useState<boolean>(false);

    const handleChange = (event: ChangeEvent<{ value: unknown }>): void => {
        setSelectedMenu(event.target.value as number);
    };

    const handleDelete = async (): Promise<void> => {
        await deletePlayerCharacters(selectedEntities);

        dispatch<UpdateStore<{ selected: number[] }>>(
            {
                type: 'UPDATE_STORE',
                reducer: 'catalogues',
                key: 'playerCharacters',
                payload: {
                    selected: []
                }
            }
        );
    };

    const handleDialogOpen = (): void => {
        setDialogOpen(true);
    };

    const handleDialogClose = (): void => {
        setDialogOpen(false);
    };

    const nothingSelected = selectedEntities.length === 0;

    // Rest are also shared by creation modal
    const { deleteButton, ...classes } = useStyles();

    return (
        <>
            <div className={classes.centered}>
                <Paper elevation={0}>
                    <Grid container spacing={4}>
                        <Grid item xs={6} container justify="flex-start">
                            <FormControl variant="outlined" className={classes.formControl}>
                                <Select
                                    value={selectedMenu}
                                    onChange={handleChange}
                                >
                                    <MenuItem value={0}>Player Characters</MenuItem>
                                    <MenuItem value={1}>Non Player Characters</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={6} container alignItems="center" justify="flex-end" className={classes.buttons}>
                            <Button
                                variant="outlined"
                                color="primary"
                                size="medium"
                                disabled={nothingSelected || selectedMenu === SELECTED_MENU.NON_PLAYER_CHARACTERS}
                            >
                                Add to Adventure
                            </Button>
                            <Button
                                variant="outlined"
                                color="primary"
                                size="medium"
                                disabled={nothingSelected || selectedMenu === SELECTED_MENU.PLAYER_CHARACTERS}
                            >
                                Add to Character
                            </Button>
                            <Button
                                variant="outlined"
                                color="primary"
                                size="medium"
                                onClick={handleDialogOpen}
                            >
                                Create
                            </Button>
                            <Button
                                variant="outlined"
                                color="primary"
                                size="medium"
                                disabled={nothingSelected}
                                className={deleteButton}
                                onClick={handleDelete}
                            >
                                Remove
                            </Button>
                        </Grid>

                        <Grid item xs={12}>
                            {selectedMenu === SELECTED_MENU.PLAYER_CHARACTERS && <PlayerCharactersTable />}
                        </Grid>
                    </Grid>
                </Paper>
            </div>

            {dialogOpen && (
                <CreatePlayerCharacterModal
                    handleDialogClose={handleDialogClose}
                    classes={classes as unknown as { [key: string]: string }}
                />
            )}
        </>
    );
};
