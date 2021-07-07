import { ReactElement, useState, useEffect, ChangeEvent, Dispatch, SetStateAction } from 'react';
import { useSelector } from 'react-redux';

import { ApplicationState } from '../../../store';

import { PlayerCharacter } from '../interfaces';

import { createPlayerCharacter } from '../requests';

import { BaseServiceResponse, NewEntityToAdd } from '../../../shared/interfaces';
import { INPUT_TYPE, NON_PLAYER_CHARACTER_FILTER } from '../../../shared/const';

import { AvailableNonPlayerCharacter } from '../../nonPlayerCharacter/interfaces';
import { fetchAvailableNonPlayerCharacters } from '../../nonPlayerCharacter/requests';

import {
    Dialog,
    DialogTitle,
    DialogContent,
    Grid,
    TextField,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    List,
    ListItem,
    ListItemText,
    LinearProgress,
    DialogActions,
    Button,
    Typography
} from '@material-ui/core';

import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';

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
        }
    })
);

interface Props {
    handleDialogClose: () => void;
    classes: { [key: string]: string };
    setResponse: Dispatch<SetStateAction<BaseServiceResponse>>;
    setOpenSnackBar: Dispatch<SetStateAction<boolean>>;
}

export const CreatePlayerCharacterModal = ({
    handleDialogClose, classes, setResponse, setOpenSnackBar }: Props): ReactElement => {

    /*
    Used exclusively to extract names and deny ui interaction
    if name of a new character already exists
    */
    const playerCharacters: PlayerCharacter[] | null = useSelector(
        (state: ApplicationState) => state.catalogues?.playerCharacters?.data ?? null
    );

    /*
    Original collection of npcs that are available for adding. Acts as a source of truth
    from which characters can be added back to what we display
    */
    const [availableNonPlayerCharacters, setAvailableNonPlayerCharacters] = useState<AvailableNonPlayerCharacter[]>();

    /*
    A replica of original npc collection that is modified via ui interaction:
    via it we show what we add or remove to/from the list avialable npcs
    */
    const [displayedAvailableNonPlayerCharacters, setDisplayedAvailableNonPlayerCharacters]
        = useState<AvailableNonPlayerCharacter[]>();

    const [name, setName] = useState<string>('');
    const [nameError, setNameError] = useState<boolean>(false);
    const [nameHelperText, setNameHelperText] = useState<string>('');

    const [description, setDescription] = useState<string>('');

    const [threadName, setThreadName] = useState<string>('');
    const [threadError, setThreadError] = useState<boolean>(false);
    const [threadHelperText, setThreadHelperText] = useState<string>('');

    const [threadDescription, setThreadDescription] = useState<string>('');

    // Collection of threads to add to new character
    const [threadsToAdd, setThreadsToAdd] = useState<NewEntityToAdd[]>([]);

    const [nonPlayerCharacterName, setNonPlayerCharacterName] = useState<string>('');
    const [nonPlayerCharacterError, setNonPlayerCharacterError] = useState<boolean>(false);
    const [nonPlayerCharacterHelperText, setNonPlayerCharacterHelperText] = useState<string>('');

    const [nonPlayerCharacterDescription, setNonPlayerCharacterDescription] = useState<string>('');

    // A collection of newly created npcs that we actually send to the API
    const [newNonPlayerCharactersToAdd, setNewNonPlayerCharactersToAdd] = useState<NewEntityToAdd[]>([]);

    // A pool of newly created and existing npcs that are displayed to the user
    const [displayedNonPlayerCharactersToAdd, setDisplayedNonPlayerCharactersToAdd] =
        useState<NewEntityToAdd[]>([]);

    // A collection of existing npcs' ids that we actually send to the API
    const [existingNonPlayerCharactersToAdd, setExistingNonPlayerCharactersToAdd] = useState<number[]>([]);

    // Variables that take part in validation
    const [playerCharacterNames, setPlayerCharacterNames] = useState<string[]>([]);

    const [nonPlayerCharacterNames, setNonPlayerCharacterNames] = useState<string[]>([]);

    const handleInputChange = (event: ChangeEvent<HTMLInputElement>): void => {
        const inputType = Number(event.target.attributes.getNamedItem('inputtype')?.value);

        const value = event.target.value;

        switch (inputType) {
            case INPUT_TYPE.ENTITY_NAME:
                if (value.length < 1) {
                    setNameError(true);
                    setNameHelperText('Please provide character name');

                    break;
                }

                // This doesn't cover character names outside of what is currently displayed on the page
                if (playerCharacterNames?.includes(value.trim().toLowerCase())) {
                    setNameError(true);
                    setNameHelperText('Character with such name already exists');

                    break;
                }

                setName(value);

                setNameError(false);
                setNameHelperText('');

                break;

            // We don't need to validate description, it's up to the user to provide it or not
            case INPUT_TYPE.ENTITY_DESCRIPTION:
                setDescription(value);

                break;

            case INPUT_TYPE.THREAD_NAME:
                setThreadName(value);

                const threadAlreadyExists = threadsToAdd.map(thread => thread.name).includes(
                    value.trim()
                );

                if (threadAlreadyExists) {
                    setThreadError(true);
                    setThreadHelperText('Such thread already exists');

                    break;
                }

                setThreadError(false);
                setThreadHelperText('');

                break;

            case INPUT_TYPE.THREAD_DESCRIPTION:
                setThreadDescription(value);

                break;

            case INPUT_TYPE.NON_PLAYER_CHARACTER_NAME:
                setNonPlayerCharacterName(value);

                /*
                Check if provided name is already taken by some of the available npcs,
                or by those that were added manually before

                This doesn't cover for such name belonging to an npc in adventure, or that is
                linked to another character, yet it still adds to better UX

                (If such name is already taked by unavailable npc, api will return 400)
                */
                const nonPlayerCharacterAlreadyExists = nonPlayerCharacterNames.includes(
                    value.trim().toLowerCase()
                );

                if (nonPlayerCharacterAlreadyExists) {
                    setNonPlayerCharacterError(true);
                    setNonPlayerCharacterHelperText('Such NPC already exists');

                    break;
                }

                setNonPlayerCharacterError(false);
                setNonPlayerCharacterHelperText('');

                break;

            case INPUT_TYPE.NON_PLAYER_CHARACTER_DESCRIPTION:
                setNonPlayerCharacterDescription(value);

                break;

        }
    };

    const handleAddingThreads = (): void => {
        setThreadsToAdd(
            [...threadsToAdd, { name: threadName, description: threadDescription } as NewEntityToAdd ]
        );

        setThreadName('');

        if (threadDescription) {
            setThreadDescription('');
        }
    };

    const handleRemovingThreads = (name: string) => (): void => {
        setThreadsToAdd(
            threadsToAdd?.filter(
                thread => thread.name !== name
            )
        );
    };

    const handleAddingNewNonPlayerCharacters = (): void => {
        // Set what we show
        setDisplayedNonPlayerCharactersToAdd(
            [
                ...displayedNonPlayerCharactersToAdd,
                { name: nonPlayerCharacterName, description: nonPlayerCharacterDescription } as NewEntityToAdd
            ]
        );

        // Set what we send
        setNewNonPlayerCharactersToAdd(
            [
                ...newNonPlayerCharactersToAdd,
                { name: nonPlayerCharacterName, description: nonPlayerCharacterDescription } as NewEntityToAdd
            ]
        );

        setNonPlayerCharacterName('');

        if (nonPlayerCharacterDescription) {
            setNonPlayerCharacterDescription('');
        }
    };

    const handleRemovingNewNonPlayerCharacters = (name: string) => (): void => {
        // Remove from what we show
        setDisplayedNonPlayerCharactersToAdd(
            displayedNonPlayerCharactersToAdd.filter(
                nonPlayerCharacter => nonPlayerCharacter.name !== name
            )
        );

        // If it is one of the available NPCs, add it back
        const availableNonPlayerCharacterToAddBack = availableNonPlayerCharacters?.find(
            nonPlayerCharacter => nonPlayerCharacter.name === name
        );

        if (availableNonPlayerCharacterToAddBack) {
            setDisplayedAvailableNonPlayerCharacters(
                [
                    ...displayedAvailableNonPlayerCharacters as AvailableNonPlayerCharacter[],
                    // We know it's there
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    availableNonPlayerCharacterToAddBack!
                ]
            );

            return;
        }

        // Otherwise it is freshly created NPC -- remove it
        setNewNonPlayerCharactersToAdd(
            newNonPlayerCharactersToAdd.filter(
                nonPlayerCharacter => nonPlayerCharacter.name !== name
            )
        );
    };

    const handleAddingExistingNonPlayerCharacter = (id: number, name: string) => (): void => {
        // Add id that is sent to the server
        setExistingNonPlayerCharactersToAdd(
            [...existingNonPlayerCharactersToAdd, id]
        );

        // Add name that is displayed in ui
        setDisplayedNonPlayerCharactersToAdd(
            [
                ...displayedNonPlayerCharactersToAdd,
                { name: name } as NewEntityToAdd
            ]
        );

        /*
        Remove npc from list of displayed available npcs:

        First, we filter out the collection of available npcs by id
        But then also check, that new collection does not contain names that were already added before
        */
        setDisplayedAvailableNonPlayerCharacters(
            availableNonPlayerCharacters?.filter(
                nonPlayerCharacter => nonPlayerCharacter.id !== id &&
                    !displayedNonPlayerCharactersToAdd.map(entity => entity.name).includes(nonPlayerCharacter.name)
            )
        );
    };

    const handleCreate = async (): Promise<void> => {
        const response = await createPlayerCharacter(
            {
                name: name,
                description: description,
                threads: threadsToAdd,
                newNonPlayerCharacters: newNonPlayerCharactersToAdd,
                existingNonPlayerCharacters: existingNonPlayerCharactersToAdd
            }
        );

        setResponse(response);

        setOpenSnackBar(true);

        if (response.success) {
            handleDialogClose();
        }
    };

    const allowedToCreate =
        name
        && !nameError
        && threadsToAdd.length
        && (existingNonPlayerCharactersToAdd.length || newNonPlayerCharactersToAdd.length);

    useEffect(() => {
        (async (): Promise<void> => {
            if (!availableNonPlayerCharacters) {
                const availableNonPlayerCharacters = await fetchAvailableNonPlayerCharacters(
                    NON_PLAYER_CHARACTER_FILTER.AVAILABLE_FOR_PLAYER_CHARACTERS
                );

                setAvailableNonPlayerCharacters(availableNonPlayerCharacters.data);

                setDisplayedAvailableNonPlayerCharacters(availableNonPlayerCharacters.data);
            }
        })();
    });

    useEffect(() => {
        if (playerCharacters) {
            setPlayerCharacterNames(
                playerCharacters?.map(playerCharacter => playerCharacter.name)
            );
        }
    }, [playerCharacters]);

    useEffect(() => {
        if (availableNonPlayerCharacters && displayedNonPlayerCharactersToAdd) {

            const namesOfAvailableNonPlayerCharacters = availableNonPlayerCharacters?.map(
                nonPlayerCharacter => nonPlayerCharacter.name
            );

            const namesOfDisplayedNonPlayerCharactersToAdd = displayedNonPlayerCharactersToAdd.map(
                nonPlayerCharacter => nonPlayerCharacter.name
            );

            const poolOfNamesToCheckAgainst = new Set(
                [
                    ...namesOfAvailableNonPlayerCharacters,
                    ...namesOfDisplayedNonPlayerCharactersToAdd
                ]
            );

            setNonPlayerCharacterNames(
                Array.from(poolOfNamesToCheckAgainst)
            );
        }

    }, [availableNonPlayerCharacters, displayedNonPlayerCharactersToAdd]);

    const { root } = useStyles();

    return (
        <Dialog
            open={true}
            onClose={handleDialogClose}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
        >
            <DialogTitle id="alert-dialog-title" className={classes.centered}>
                Create Character
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
                            value={threadName}
                            error={threadError}
                            helperText={threadHelperText}
                            variant="outlined"
                            required
                            fullWidth
                            label="Thread Name"
                            onChange={handleInputChange}
                            inputProps={{ inputtype: INPUT_TYPE.THREAD_NAME }}
                            className={root}
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <TextField
                            value={threadDescription}
                            variant="outlined"
                            fullWidth
                            label="Thread Description"
                            onChange={handleInputChange}
                            inputProps={{ inputtype: INPUT_TYPE.THREAD_DESCRIPTION }}
                        />
                    </Grid>

                    <Grid item container xs={12} justify="flex-end">
                        <Button
                            variant="contained"
                            color="secondary"
                            disabled={!threadName || threadError}
                            onClick={handleAddingThreads}
                        >
                            Add
                        </Button>
                    </Grid>

                    <Grid item xs={12}>
                        <Accordion
                            disabled={threadsToAdd.length === 0}
                            expanded={threadsToAdd.length > 0}
                        >
                            <AccordionSummary
                                aria-controls="newThreads-content"
                                id="newThreads-header"
                            >
                                <Typography>
                                    Your Threads
                                </Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                <List style={{ width: '100%' }}>
                                    {threadsToAdd.map((thread, index) => {
                                        return (
                                            <ListItem
                                                key={`new-thread-${index}`}
                                                button
                                                onClick={handleRemovingThreads(
                                                    thread.name
                                                )}
                                            >
                                                <ListItemText primary={thread.name} />
                                            </ListItem>
                                        );
                                    })}
                                </List>
                            </AccordionDetails>
                        </Accordion>
                    </Grid>

                    <Grid item xs={12}>
                        <TextField
                            value={nonPlayerCharacterName}
                            error={nonPlayerCharacterError}
                            helperText={nonPlayerCharacterHelperText}
                            variant="outlined"
                            required
                            fullWidth
                            label="NPC Name"
                            onChange={handleInputChange}
                            inputProps={{ inputtype: INPUT_TYPE.NON_PLAYER_CHARACTER_NAME }}
                            className={root}
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <TextField
                            value={nonPlayerCharacterDescription}
                            variant="outlined"
                            fullWidth
                            label="NPC Description"
                            onChange={handleInputChange}
                            inputProps={{ inputtype: INPUT_TYPE.NON_PLAYER_CHARACTER_DESCRIPTION }}
                        />
                    </Grid>

                    <Grid item container xs={12} justify="flex-end">
                        <Button
                            variant="contained"
                            color="secondary"
                            disabled={!nonPlayerCharacterName || nonPlayerCharacterError}
                            onClick={handleAddingNewNonPlayerCharacters}
                        >
                            Add
                        </Button>
                    </Grid>

                    <Grid item xs={12}>
                        <Accordion
                            disabled={displayedNonPlayerCharactersToAdd.length === 0}
                            expanded={displayedNonPlayerCharactersToAdd.length > 0}
                        >
                            <AccordionSummary
                                aria-controls="newNonPlayerCharacters-content"
                                id="newNonPlayerCharacters-header"
                            >
                                <Typography>
                                    Your NPCs
                                </Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                <List style={{ width: '100%' }}>
                                    {displayedNonPlayerCharactersToAdd.map((nonPlayerCharacter, index) => {
                                        return (
                                            <ListItem
                                                key={`new-npc-${index}`}
                                                button
                                                onClick={handleRemovingNewNonPlayerCharacters(
                                                    nonPlayerCharacter.name
                                                )}
                                            >
                                                <ListItemText primary={nonPlayerCharacter.name} />
                                            </ListItem>
                                        );
                                    })}
                                </List>
                            </AccordionDetails>
                        </Accordion>
                    </Grid>

                    <Grid item xs={12}>
                        {availableNonPlayerCharacters ? (
                            <Accordion>
                                <AccordionSummary
                                    expandIcon={<ExpandMoreIcon />}
                                    aria-controls="availableNonPlayerCharacters-content"
                                    id="availableNonPlayerCharacters-header"
                                >
                                    <Typography>
                                        {displayedAvailableNonPlayerCharacters?.length
                                            ? 'Available NPCs'
                                            : 'No available NPCs'
                                        }
                                    </Typography>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <List style={{ width: '100%' }}>
                                        {displayedAvailableNonPlayerCharacters?.map((nonPlayerCharacter, index) => {
                                            return (
                                                <ListItem
                                                    key={`avaialable-npc-${index}`}
                                                    button
                                                    onClick={handleAddingExistingNonPlayerCharacter(
                                                        nonPlayerCharacter.id,
                                                        nonPlayerCharacter.name
                                                    )}
                                                >
                                                    <ListItemText primary={nonPlayerCharacter.name} />
                                                </ListItem>
                                            );
                                        })}
                                    </List>
                                </AccordionDetails>
                            </Accordion>
                        ) : <LinearProgress />}
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions className={clsx(classes.centered, classes.buttons)}>
                <Button onClick={handleDialogClose} variant="contained" color="secondary">
                    Cancel
                </Button>
                <Button onClick={handleCreate} variant="contained" color="primary" disabled={!allowedToCreate}>
                    Create
                </Button>
            </DialogActions>
        </Dialog>
    );
};
