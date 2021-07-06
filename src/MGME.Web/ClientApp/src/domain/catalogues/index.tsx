import { ReactElement, useState, ChangeEvent, SyntheticEvent, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { ApplicationState, UpdateStore } from '../../store';

import { BaseServiceResponse } from '../../shared/interfaces';

import { PlayerCharactersTable, CreatePlayerCharacterModal } from '../playerCharacter/components';
import { deletePlayerCharacters, addToPlayerCharacter } from '../playerCharacter/requests';

import { NonPlayerCharactersTable } from '../nonPlayerCharacter/components';
import { deleteNonPlayerCharacters } from '../nonPlayerCharacter/requests';

import { AdventuresToAddToTable } from '../adventures/components';
import { addToAdventure } from '../adventures/requests';

import {
    Paper,
    Grid,
    FormControl,
    Select,
    MenuItem,
    Button,
    Snackbar,
    Theme,
    Divider
} from '@material-ui/core';

import { Alert } from '../../shared/components';
import { PLAYER_CHARACTER_TABLE_DISPLAY_MODE } from '../../shared/const';

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

export const Catalogues = (): ReactElement => {
    const dispatch = useDispatch();

    const [selectedMenu, setSelectedMenu] = useState<number>(SELECTED_MENU.PLAYER_CHARACTERS);

    /*
    If we're looking at characters, selected corresponds to list of their ids
    If we're looking at npcs, selected corresponds to single id of character we want to add npcs to
    */
    const selectedPlayerCharacters = useSelector(
        (store: ApplicationState) => store.catalogues?.playerCharacters?.selected
    );

    const selectedNonPlayerCharacters = useSelector(
        (store: ApplicationState) => store.catalogues?.nonPlayerCharacters?.selected ?? []
    );

    const selectedAdventure = useSelector(
        (store: ApplicationState) => store.catalogues?.adventures?.selected
    );

    const [dialogOpen, setDialogOpen] = useState<boolean>(false);

    const [openSnackbar, setOpenSnackbar] = useState<boolean>(false);

    const [response, setResponse] = useState<BaseServiceResponse>({} as BaseServiceResponse);

    const [displayAdventures, setDisplayAdventures] = useState<boolean>(false);

    const [displayCharactersToAddTo, setDisplayCharactersToAddTo] = useState<boolean>(false);

    const handleChange = (event: ChangeEvent<{ value: unknown }>): void => {
        setSelectedMenu(event.target.value as number);

        const itsPlayerCharacters = selectedMenu === SELECTED_MENU.PLAYER_CHARACTERS;

        dispatch<UpdateStore<{ selected: number[] }>>(
            {
                type: 'UPDATE_STORE',
                reducer: 'catalogues',
                key: itsPlayerCharacters ? 'playerCharacters' : 'nonPlayerCharacters',
                payload: {
                    selected: []
                }
            }
        );

        itsPlayerCharacters ? setDisplayAdventures(false) : setDisplayCharactersToAddTo(false);
    };

    const handleDelete = async (): Promise<void> => {
        const itsPlayerCharacters = selectedMenu === SELECTED_MENU.PLAYER_CHARACTERS;

        const response = itsPlayerCharacters
            ? await deletePlayerCharacters(selectedPlayerCharacters as number[])
            : await deleteNonPlayerCharacters(selectedNonPlayerCharacters);

        setResponse(response);

        setOpenSnackbar(true);

        if (response.success) {
            dispatch<UpdateStore<{ selected: number[] }>>(
                {
                    type: 'UPDATE_STORE',
                    reducer: 'catalogues',
                    key: itsPlayerCharacters ? 'playerCharacters' : 'nonPlayerCharacters',
                    payload: {
                        selected: []
                    }
                }
            );
        }
    };

    const handleRequestAdventuresToAddTo = async (): Promise<void> => {
        setDisplayAdventures(true);
    };

    const handleAddToAdventure = async (): Promise<void> => {
        const key = selectedMenu === SELECTED_MENU.PLAYER_CHARACTERS ? 'playerCharacters' : 'nonPlayerCharacters';

        // We know value is there, otherwise handler wouldn't be called in the first place
        const response = await addToAdventure(
            {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                adventure: selectedAdventure!,
                playerCharacters: selectedPlayerCharacters as number[],
                nonPlayerCharacters: selectedNonPlayerCharacters,
                keys: [key]
            }
        );

        setResponse(response);

        setOpenSnackbar(true);

        if (response.success) {
            dispatch<UpdateStore<{ selected: number[] }>>(
                {
                    type: 'UPDATE_STORE',
                    reducer: 'catalogues',
                    key: key,
                    payload: {
                        selected: []
                    }
                }
            );

            dispatch<UpdateStore<{ selected: number }>>(
                {
                    type: 'UPDATE_STORE',
                    reducer: 'catalogues',
                    key: 'adventures',
                    payload: {
                        selected: 0
                    }
                }
            );
        }
    };

    const handleCancelAddToAdventure = (): void => {
        setDisplayAdventures(false);

        dispatch<UpdateStore<{ selected: number }>>(
            {
                type: 'UPDATE_STORE',
                reducer: 'catalogues',
                key: 'adventures',
                payload: {
                    selected: 0
                }
            }
        );
    };

    const handleRequestCharactersToAddTo = async (): Promise<void> => {
        setDisplayCharactersToAddTo(true);
    };

    const handleAddToPlayerCharacter = async (): Promise<void> => {
        // Temp hardcode
        const response = await addToPlayerCharacter(
            {
                playerCharacter: 86,
                nonPlayerCharacters: [94]
            }
        );

        setResponse(response);

        setOpenSnackbar(true);

        if (response.success) {
            dispatch<UpdateStore<{ selected: number[] }>>(
                {
                    type: 'UPDATE_STORE',
                    reducer: 'catalogues',
                    key: 'nonPlayerCharacters',
                    payload: {
                        selected: []
                    }
                }
            );
        }
    };

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

    useEffect(() => {
        if (nothingSelected) {
            setDisplayAdventures(false);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedPlayerCharacters, selectedNonPlayerCharacters]);

    /*
    We are forced to check for value here, since we don't give it a default
    As it can be either list or int
    */
    const nothingSelected = selectedPlayerCharacters && selectedMenu === SELECTED_MENU.PLAYER_CHARACTERS
        ? (selectedPlayerCharacters as number[]).length === 0
        : selectedNonPlayerCharacters.length === 0;

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
                                disabled={nothingSelected || displayAdventures}
                                onClick={handleRequestAdventuresToAddTo}
                            >
                                Add to Adventure
                            </Button>
                            <Button
                                variant="outlined"
                                color="primary"
                                size="medium"
                                disabled={nothingSelected || selectedMenu === SELECTED_MENU.PLAYER_CHARACTERS}
                                onClick={handleRequestCharactersToAddTo}
                            >
                                Add to Character
                            </Button>
                            <Button
                                variant="outlined"
                                color="primary"
                                size="medium"
                                onClick={handleDialogOpen}
                                disabled={!nothingSelected || displayAdventures}
                            >
                                Create
                            </Button>
                            <Button
                                variant="outlined"
                                color="primary"
                                size="medium"
                                disabled={nothingSelected || displayAdventures}
                                className={deleteButton}
                                onClick={handleDelete}
                            >
                                Remove
                            </Button>
                        </Grid>

                        <Grid item xs={12}>
                            {selectedMenu === SELECTED_MENU.PLAYER_CHARACTERS && (
                                <PlayerCharactersTable mode={PLAYER_CHARACTER_TABLE_DISPLAY_MODE.TO_SHOW} />
                            )}

                            {selectedMenu === SELECTED_MENU.NON_PLAYER_CHARACTERS && <NonPlayerCharactersTable />}
                        </Grid>

                        {displayAdventures && (
                            <Grid item xs={12}>
                                <Divider />
                                <AdventuresToAddToTable />
                                <Grid
                                    item
                                    container
                                    xs={12}
                                    alignItems="center"
                                    justify="flex-end"
                                    className={classes.buttons}
                                    style={{ marginTop: '2em' }}
                                >
                                    <Button
                                        variant="outlined"
                                        color="secondary"
                                        size="medium"
                                        disabled={!selectedAdventure}
                                        onClick={handleCancelAddToAdventure}
                                    >
                                            Cancel
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        color="primary"
                                        size="medium"
                                        disabled={!selectedAdventure}
                                        onClick={handleAddToAdventure}
                                    >
                                            Add
                                    </Button>
                                </Grid>
                            </Grid>
                        )}

                        {displayCharactersToAddTo && (
                            <Grid item xs={12}>
                                <Divider />
                                <PlayerCharactersTable mode={PLAYER_CHARACTER_TABLE_DISPLAY_MODE.TO_ADD_TO} />
                                <Grid
                                    item
                                    container
                                    xs={12}
                                    alignItems="center"
                                    justify="flex-end"
                                    className={classes.buttons}
                                    style={{ marginTop: '2em' }}
                                >
                                    <Button
                                        variant="outlined"
                                        color="secondary"
                                        size="medium"
                                        disabled={!selectedAdventure}
                                    >
                                            Cancel
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        color="primary"
                                        size="medium"
                                        disabled={!selectedAdventure}
                                        onClick={handleAddToPlayerCharacter}
                                    >
                                            Add
                                    </Button>
                                </Grid>
                            </Grid>
                        )}
                    </Grid>
                </Paper>
            </div>

            {dialogOpen && (
                <CreatePlayerCharacterModal
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
