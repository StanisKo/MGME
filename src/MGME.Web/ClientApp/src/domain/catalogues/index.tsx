import { ReactElement, useState, ChangeEvent } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { ApplicationState, UpdateStore } from '../../store';

import { entityNames } from './helpers';

import { PlayerCharactersTable } from '../playerCharacter/components/playerCharactersTable';
import { deletePlayerCharacters } from '../playerCharacter/requests';

import { INPUT_TYPE, NON_PLAYER_CHARACTER_FILTER } from '../../shared/const';
import { AvailableNonPlayerCharacter, Pagination, NewEntityToAdd } from '../../shared/interfaces';
import { fetchAvailableNonPlayerCharacters } from '../../shared/requests';

import {
    Paper,
    Grid,
    FormControl,
    Select,
    MenuItem,
    Button,
    Theme,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    List,
    ListItem,
    ListItemText,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Typography,
    LinearProgress,
    TablePagination,
    InputLabel,
    FormHelperText
} from '@material-ui/core';

import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

import { createStyles, makeStyles } from '@material-ui/core/styles';

import clsx from 'clsx';

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
*/

export const Catalogues = (): ReactElement => {
    const dispatch = useDispatch();

    const selectedEntities = useSelector(
        (store: ApplicationState) => store.catalogues?.playerCharacters?.selected ?? []
    );

    const [selectedMenu, setSelectedMenu] = useState<number>(SELECTED_MENU.PLAYER_CHARACTERS);

    const [dialogOpen, setDialogOpen] = useState<boolean>(false);

    // Will be generic when npc side of catalogues is be ready
    const [availableNonPlayerCharacters, setAvailableNonPlayerCharacters] = useState<AvailableNonPlayerCharacter[]>();

    // We paginate list of available entities
    const [pagination, setPagination] = useState<Pagination>({} as Pagination);
    const [page, setPage] = useState(0);

    const [name, setName] = useState<string>('');
    const [nameError, setNameError] = useState<boolean>(false);
    const [nameHelperText, setNameHelperText] = useState<string>('');

    const [description, setDescription] = useState<string>('');

    const [newThreadsToAdd, setNewThreadsToAdd] = useState<NewEntityToAdd[]>([]);

    const [newNonPlayerCharactersToAdd, setNewNonPlayerChartersToAdd] = useState<NewEntityToAdd[]>([]);

    const [existingNonPlayerCharactersToAdd, setExistingNonPlayerCharactersToAdd] = useState<number[]>([]);

    console.log(description);

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

    const handleDialogOpen = async (): Promise<void> => {
        if (!availableNonPlayerCharacters) {
            const availableNonPlayerCharacters = await fetchAvailableNonPlayerCharacters(
                NON_PLAYER_CHARACTER_FILTER.AVAILABLE_FOR_PLAYER_CHARACTERS
            );

            setAvailableNonPlayerCharacters(availableNonPlayerCharacters.data);
            setPagination(availableNonPlayerCharacters.pagination);
        }

        setDialogOpen(true);
    };
    
    const handleDialogClose = (): void => {
        setDialogOpen(false);
    };

    const handleInputChange = (event: ChangeEvent<HTMLInputElement>): void => {
        const inputType = Number(event.target.attributes.getNamedItem('inputtype')?.value);

        const value = event.target.value;

        switch (inputType) {
            case INPUT_TYPE.ENTITY_NAME:
                if (value.length < 1) {
                    setNameError(true);
                    setNameHelperText('Please provide character name');

                    return;
                }
                else {
                    setName(value);

                    setNameError(false);
                    setNameHelperText('');
                }

                break;

            // We don't need to validate description, it's up to the user to provide it or not
            case INPUT_TYPE.ENTITY_DESCRIPTION:
                setDescription(value);

                break;
        }
    };

    const handleRemovingNewThreadsToAdd = (event: ChangeEvent<{ value: unknown }>): void => {
        const threadName = event.target.value as string;

        setNewThreadsToAdd(
            newThreadsToAdd?.filter(
                thread => thread.name !== threadName
            )
        );
    };

    const handleRemovingNewNonPlayerCharactersToAdd = (event: ChangeEvent<{ value: unknown }>): void => {
        const nonPlayerCharacterName = event.target.value as string;

        setNewNonPlayerChartersToAdd(
            newNonPlayerCharactersToAdd?.filter(
                nonPlayerCharacter => nonPlayerCharacter.name !== nonPlayerCharacterName
            )
        );

        /*
        We also add back available npcs, if any
        By grabbing them from the store directly
        Since local collection does not contain them anymore
        */
    };

    // Curry the function to avoid anon functions in the markup
    const handleAddingExistingNonPlayerCharacter = (id: number, name: string) => (): void => {
        setExistingNonPlayerCharactersToAdd(
            [...existingNonPlayerCharactersToAdd, id]
        );

        setAvailableNonPlayerCharacters(
            availableNonPlayerCharacters?.filter(
                nonPlayerCharacter => nonPlayerCharacter.id !== id
            )
        );

        /*
        We also add exiting nonPlayerCharacters to new
        so that the user can see all npcs he added/created for that particular char
        */
        setNewNonPlayerChartersToAdd(
            [...newNonPlayerCharactersToAdd, { name: name } as NewEntityToAdd]
        );
    };

    const handlePageChange = async (event: unknown, newPage: number): Promise<void> => {
        setPage(newPage);

        const availableNonPlayerCharacters = await fetchAvailableNonPlayerCharacters(
            NON_PLAYER_CHARACTER_FILTER.AVAILABLE_FOR_PLAYER_CHARACTERS,
            newPage + 1
        );

        setAvailableNonPlayerCharacters(availableNonPlayerCharacters.data);
        setPagination(availableNonPlayerCharacters.pagination);
    };

    const handleCreate = async (): Promise<void> => {
        setDialogOpen(false);
    };

    const nothingSelected = selectedEntities.length === 0;

    const allowedToCreate =
        name
        && !nameError
        && newThreadsToAdd.length
        && existingNonPlayerCharactersToAdd.length;

    // selectedMenu is not 0 (then it is 1) ? index first value : index second value
    const relatedEntities = entityNames[
        selectedMenu ? selectedMenu - 1 : selectedMenu + 1
    ];

    const { root, centered, formControl, buttons, deleteButton } = useStyles();

    return (
        <>
            <div className={centered}>
                <Paper elevation={0}>
                    <Grid container spacing={4}>
                        <Grid item xs={6} container justify="flex-start">
                            <FormControl variant="outlined" className={formControl}>
                                <Select
                                    value={selectedMenu}
                                    onChange={handleChange}
                                >
                                    <MenuItem value={0}>Player Characters</MenuItem>
                                    <MenuItem value={1}>Non Player Characters</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={6} container alignItems="center" justify="flex-end" className={buttons}>
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

            <Dialog
                open={dialogOpen}
                onClose={handleDialogOpen}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title" className={centered}>
                    {`Create ${entityNames[selectedMenu]}`}
                </DialogTitle>
                <DialogContent>
                    <Grid container spacing={4}>
                        <Grid item xs={12}>
                            <TextField
                                error={nameError}
                                helperText={nameHelperText}
                                variant="outlined"
                                required
                                fullWidth
                                label="Name"
                                onChange={handleInputChange}
                                inputProps={{ inputtype: INPUT_TYPE.ENTITY_NAME }}
                                className={root}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                variant="outlined"
                                fullWidth
                                label="Description"
                                onChange={handleInputChange}
                                inputProps={{ inputtype: INPUT_TYPE.ENTITY_DESCRIPTION }}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                variant="outlined"
                                required
                                fullWidth
                                label="Thread Name"
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                variant="outlined"
                                fullWidth
                                label="Thread Description"
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <FormControl className={formControl} style={{ width: '100%' }}>
                                <InputLabel>
                                    {newThreadsToAdd.length
                                        ? newThreadsToAdd.length > 1
                                            ? `${newThreadsToAdd.length} Threads`
                                            : newThreadsToAdd[0].name
                                        : 'Your Threads Here'
                                    }
                                </InputLabel>
                                <Select
                                    disabled={!newThreadsToAdd.length}
                                    onChange={handleRemovingNewThreadsToAdd}
                                >
                                    {newThreadsToAdd.map((thread, index) => {
                                        return (
                                            <MenuItem
                                                key={`added-thread-${index}`}
                                                value={thread.name}
                                            >
                                                {thread.name}
                                            </MenuItem>
                                        );
                                    })}
                                </Select>
                                <FormHelperText>At least one*</FormHelperText>
                            </FormControl>
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                variant="outlined"
                                required
                                fullWidth
                                label="NPC Name"
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                variant="outlined"
                                fullWidth
                                label="NPC Description"
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <FormControl className={formControl} style={{ width: '100%' }}>
                                <InputLabel>
                                    {newNonPlayerCharactersToAdd.length
                                        ? newNonPlayerCharactersToAdd.length > 1
                                            ? `${newNonPlayerCharactersToAdd.length} NPCs`
                                            : newNonPlayerCharactersToAdd[0].name
                                        : 'Your NPCs Here'
                                    }
                                </InputLabel>
                                <Select
                                    value={newNonPlayerCharactersToAdd}
                                    disabled={!newNonPlayerCharactersToAdd.length}
                                    onChange={handleRemovingNewNonPlayerCharactersToAdd}
                                >
                                    {newNonPlayerCharactersToAdd.map((nonPlayerCharacter, index) => {
                                        return (
                                            <MenuItem
                                                key={`added-npc-${index}`}
                                                value={nonPlayerCharacter.name}
                                            >
                                                {nonPlayerCharacter.name}
                                            </MenuItem>
                                        );
                                    })}
                                </Select>
                                <FormHelperText>At least one*</FormHelperText>
                            </FormControl>
                        </Grid>

                        <Grid item xs={12}>
                            {availableNonPlayerCharacters ? (
                                <Accordion>
                                    <AccordionSummary
                                        expandIcon={<ExpandMoreIcon />}
                                        aria-controls="panel1a-content"
                                        id="panel1a-header"
                                    >
                                        <Typography>
                                            {/* eslint-disable-next-line max-len */}
                                            {availableNonPlayerCharacters?.length ? `Available ${relatedEntities}s` : `No available ${relatedEntities}s`}
                                        </Typography>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        <List style={{ width: '100%' }}>
                                            {availableNonPlayerCharacters?.map((nonPlayerCharacter, index) => {
                                                return (
                                                    <ListItem
                                                        key={`avaialable-npc-${index}`}
                                                        button
                                                        /* eslint-disable-next-line max-len */
                                                        onClick={handleAddingExistingNonPlayerCharacter(
                                                            nonPlayerCharacter.id,
                                                            nonPlayerCharacter.name
                                                        )}
                                                    >
                                                        <ListItemText primary={nonPlayerCharacter.name} />
                                                    </ListItem>
                                                );
                                            })}
                                            <TablePagination
                                                component="div"
                                                rowsPerPage={15}
                                                rowsPerPageOptions={[]}
                                                count={pagination.numberOfResults}
                                                page={page}
                                                onChangePage={handlePageChange}
                                            />
                                        </List>
                                    </AccordionDetails>
                                </Accordion>
                            ) : <LinearProgress />}
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions className={clsx(centered, buttons)}>
                    <Button onClick={handleDialogClose} variant="contained" color="secondary">
                        Cancel
                    </Button>
                    <Button onClick={handleCreate} variant="contained" color="primary" disabled={!allowedToCreate}>
                        Create
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};
