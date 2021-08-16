import { ReactElement, useState, useEffect, Dispatch, SetStateAction, ChangeEvent } from 'react';
import { useSelector } from 'react-redux';

import { ApplicationState } from '../../../store';

import { Adventure } from '../interfaces';
import { createAdventure } from '../requests';
import { chaosFactorOptions } from '../helpers';

import { BaseServiceResponse, NewEntityToAdd } from '../../../shared/interfaces';
import { INPUT_TYPE, NON_PLAYER_CHARACTER_FILTER } from '../../../shared/const';

import { AvailablePlayerCharacter } from '../../playerCharacter/interfaces';
import { fetchAvailablePlayerCharacters } from '../../playerCharacter/requests';

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
    Typography,
    Slider
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

export const CreateAdventureModal = (
    { handleDialogClose, classes, setResponse, setOpenSnackBar }: Props): ReactElement => {

    /*
    Used exclusively to extract names and deny ui interaction
    if name of a new adventure already exists
    */
    const adventures: Adventure[] | null = useSelector(
        (state: ApplicationState) => state.adventures?.dataset?.data ?? null
    );

    const [title, setTitle] = useState<string>('');
    const [titleError, setTitleError] = useState<boolean>(false);
    const [titleHelperText, setTitleHelperText] = useState<string>('');

    const [context, setContext] = useState<string>('');
    const [contextError, setContextError] = useState<boolean>(false);
    const [contextHelperText, setContextHelperText] = useState<string>('');

    const [threadName, setThreadName] = useState<string>('');
    const [threadError, setThreadError] = useState<boolean>(false);
    const [threadHelperText, setThreadHelperText] = useState<string>('');

    const [threadDescription, setThreadDescription] = useState<string>('');

    // Collection of threads to add to new adventure
    const [threadsToAdd, setThreadsToAdd] = useState<NewEntityToAdd[]>([]);

    const [nonPlayerCharacterName, setNonPlayerCharacterName] = useState<string>('');
    const [nonPlayerCharacterError, setNonPlayerCharacterError] = useState<boolean>(false);
    const [nonPlayerCharacterHelperText, setNonPlayerCharacterHelperText] = useState<string>('');

    const [nonPlayerCharacterDescription, setNonPlayerCharacterDescription] = useState<string>('');

    // A collection of player characters that are available for adding
    const [availablePlayerCharacters, setAvailablePlayerCharacters] = useState<AvailablePlayerCharacter[]>();

    // A collection of player characters' ids that we send to API
    const [playerCharactersToAdd, setPlayerCharactersToAdd] = useState<number[]>([]);

    // A collection of npcs that are available for adding
    const [availableNonPlayerCharacters, setAvailableNonPlayerCharacters] = useState<AvailableNonPlayerCharacter[]>();

    // A collection of existing npcs' ids that we send to the API
    const [existingNonPlayerCharactersToAdd, setExistingNonPlayerCharactersToAdd] = useState<number[]>([]);

    // A collection of newly created npcs that we send to the API
    const [newNonPlayerCharactersToAdd, setNewNonPlayerCharactersToAdd] = useState<NewEntityToAdd[]>([]);

    // A pool of newly created and existing npcs that are displayed to the user
    const [displayedNonPlayerCharactersToAdd, setDisplayedNonPlayerCharactersToAdd] =
        useState<NewEntityToAdd[]>([]);

    // Takes part in validing titles of new adventures
    const [adventureTitles, setAdventureTitles] = useState<string[]>([]);

    // Takes part in validing names of freshly created/added from existing npcs
    const [nonPlayerCharacterNames, setNonPlayerCharacterNames] = useState<string[]>([]);

    const [chaosFactor, setChaosFactor] = useState<number>(5);

    const { root } = useStyles();

    const handleInputChange = (event: ChangeEvent<HTMLInputElement>): void => {
        const inputType = Number(event.target.attributes.getNamedItem('inputtype')?.value);

        const value = event.target.value;

        const normalizedInput = value.trim().toLowerCase();

        switch (inputType) {
            case INPUT_TYPE.ENTITY_NAME:
                if (normalizedInput.length < 1) {
                    setTitleError(true);
                    setTitleHelperText('Please provide adventure title');

                    break;
                }

                // This doesn't cover adventure names outside of what is currently displayed on the page
                if (adventureTitles?.includes(normalizedInput)) {
                    setTitleError(true);
                    setTitleHelperText('Adventure with such title already exists');

                    break;
                }

                setTitle(value);

                setTitleError(false);
                setTitleHelperText('');

                break;

            case INPUT_TYPE.ENTITY_DESCRIPTION:
                if (normalizedInput.length < 1) {
                    setContextError(true);
                    setContextHelperText('Please provide adventure context');

                    break;
                }

                setContext(value);

                setContextError(false);
                setContextHelperText('');

                break;

            case INPUT_TYPE.THREAD_NAME:
                setThreadName(value);

                const threadAlreadyExists = threadsToAdd.map(thread => thread.name.toLowerCase()).includes(
                    normalizedInput
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

                const nonPlayerCharacterAlreadyExists = nonPlayerCharacterNames.map(
                    name => name.toLowerCase()
                ).includes(
                    normalizedInput
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

        // Clean up
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

        /*
        If it is one of the available NPCs, add it back
        by removing from the list of ids we send to api
        */
        const availableNonPlayerCharacterToAddBack = availableNonPlayerCharacters?.find(
            nonPlayerCharacter => nonPlayerCharacter.name === name
        );

        if (availableNonPlayerCharacterToAddBack) {
            setExistingNonPlayerCharactersToAdd(
                existingNonPlayerCharactersToAdd.filter(
                    id => id !== availableNonPlayerCharacterToAddBack.id
                )
            );

            return;
        }

        // Otherwise it is freshly created NPC -- remove it from what we send
        setNewNonPlayerCharactersToAdd(
            newNonPlayerCharactersToAdd.filter(
                nonPlayerCharacter => nonPlayerCharacter.name !== name
            )
        );
    };

    const handleAddingExistingNonPlayerCharacter = (id: number, name: string) => (): void => {
        // Set what we send
        setExistingNonPlayerCharactersToAdd(
            [...existingNonPlayerCharactersToAdd, id]
        );

        // Set what we show
        setDisplayedNonPlayerCharactersToAdd(
            [
                ...displayedNonPlayerCharactersToAdd,
                { name: name } as NewEntityToAdd
            ]
        );
    };

    const handleAddingPlayerCharacters = (id: number) => (): void => {
        // Set what we send
        setPlayerCharactersToAdd(
            [...playerCharactersToAdd, id]
        );
    };

    const handleRemovingPlayerCharacters = (id: number) => (): void => {
        // Remove from what we send
        setPlayerCharactersToAdd(
            playerCharactersToAdd.filter(
                playerCharacterId => playerCharacterId !== id
            )
        );
    };

    const handleChangeChaosFactor = (event: ChangeEvent<unknown>, value: number | number[]): void => {
        setChaosFactor(value as number);

        /*
        What's up Material UI?
        C:617 Uncaught TypeError: Cannot read property 'getBoundingClientRect' of null
        */
        console.clear();
    };

    const handleCreate = async (): Promise<void> => {
        const response = await createAdventure(
            {
                title: title.trim(),

                context: context.trim(),

                chaosFactor: chaosFactor,

                threads: threadsToAdd.map(
                    thread => {
                        return {
                            name: thread.name.trim(), description: thread.description.trim()
                        };
                    }
                ),

                newNonPlayerCharacters: newNonPlayerCharactersToAdd.map(
                    nonPlayerCharacter => {
                        return {
                            name: nonPlayerCharacter.name.trim(), description: nonPlayerCharacter.description.trim()
                        };
                    }
                ),

                existingNonPlayerCharacters: existingNonPlayerCharactersToAdd,

                playerCharacters: playerCharactersToAdd
            }
        );

        setResponse(response);

        setOpenSnackBar(true);

        if (response.success) {
            handleDialogClose();
        }
    };

    const allowedToCreate =
        title
        && !titleError
        && context
        && !contextError
        && threadsToAdd.length
        && playerCharactersToAdd.length
        && (existingNonPlayerCharactersToAdd.length || newNonPlayerCharactersToAdd.length);

    useEffect(() => {
        (async (): Promise<void> => {
            if (!availablePlayerCharacters) {
                const availablePlayerCharacters = await fetchAvailablePlayerCharacters();

                setAvailablePlayerCharacters(availablePlayerCharacters.data);
            }

            if (!availableNonPlayerCharacters) {
                const availableNonPlayerCharacters = await fetchAvailableNonPlayerCharacters(
                    NON_PLAYER_CHARACTER_FILTER.AVAILABLE_FOR_ADVENTURES
                );

                setAvailableNonPlayerCharacters(availableNonPlayerCharacters.data);
            }
        })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (adventures) {
            setAdventureTitles(
                adventures?.map(
                    adventure => adventure.title.toLowerCase()
                )
            );
        }
    }, [adventures]);

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
                Array.from(poolOfNamesToCheckAgainst).map(
                    name => name.toLowerCase()
                )
            );
        }

    }, [availableNonPlayerCharacters, displayedNonPlayerCharactersToAdd]);

    return (
        <Dialog
            open={true}
            onClose={handleDialogClose}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
        >
            <DialogTitle id="alert-dialog-title" className={classes.centered}>
                Create Adventure
            </DialogTitle>
            <DialogContent>
                <Grid container spacing={4}>
                    <Grid item xs={12}>
                        <TextField
                            error={titleError}
                            helperText={titleHelperText}
                            variant="outlined"
                            required
                            fullWidth
                            label="Title"
                            onChange={handleInputChange}
                            inputProps={{ inputtype: INPUT_TYPE.ENTITY_NAME }}
                            className={root}
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <TextField
                            error={contextError}
                            helperText={contextHelperText}
                            variant="outlined"
                            required
                            fullWidth
                            label="Context"
                            onChange={handleInputChange}
                            inputProps={{ inputtype: INPUT_TYPE.ENTITY_DESCRIPTION }}
                            className={root}
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <Accordion
                            disabled={(availablePlayerCharacters?.filter(
                                playerCharacter => playerCharactersToAdd.includes(playerCharacter.id)
                            ) ?? []).length === 0}

                            expanded={(availablePlayerCharacters?.filter(
                                playerCharacter => playerCharactersToAdd.includes(playerCharacter.id)
                            ) ?? []).length > 0}
                        >
                            <AccordionSummary
                                aria-controls="playerCharacters-content"
                                id="playerCharacters-header"
                            >
                                <Typography>
                                    Your Characters
                                </Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                <List style={{ width: '100%' }}>
                                    {availablePlayerCharacters?.filter(
                                        playerCharacter => playerCharactersToAdd.includes(playerCharacter.id)
                                    ).map((playerCharacter, index) => {
                                        return (
                                            <ListItem
                                                key={`playerCharacterToAdd-${index}`}
                                                button
                                                onClick={handleRemovingPlayerCharacters(
                                                    playerCharacter.id
                                                )}
                                            >
                                                <ListItemText primary={playerCharacter.name} />
                                            </ListItem>
                                        );
                                    })}
                                </List>
                            </AccordionDetails>
                        </Accordion>
                    </Grid>

                    <Grid item xs={12}>
                        {availablePlayerCharacters ? (
                            <Accordion>
                                <AccordionSummary
                                    expandIcon={<ExpandMoreIcon />}
                                    aria-controls="availablePlayerCharacters-content"
                                    id="availablePlayerCharacters-header"
                                >
                                    <Typography>
                                        {availablePlayerCharacters?.filter(
                                            playerCharacter => !playerCharactersToAdd.includes(
                                                playerCharacter.id
                                            )
                                        )?.length ? 'Available Characters' : 'No Available Characters'
                                        }
                                    </Typography>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <List style={{ width: '100%' }}>
                                        {availablePlayerCharacters?.filter(
                                            playerCharacter => !playerCharactersToAdd.includes(
                                                playerCharacter.id
                                            )
                                        )?.map((playerCharacter, index) => {
                                            return (
                                                <ListItem
                                                    key={`avaialable-character-${index}`}
                                                    button
                                                    onClick={handleAddingPlayerCharacters(
                                                        playerCharacter.id
                                                    )}
                                                >
                                                    <ListItemText primary={playerCharacter.name} />
                                                </ListItem>
                                            );
                                        })}
                                    </List>
                                </AccordionDetails>
                            </Accordion>
                        ) : <LinearProgress />}
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
                                        {availableNonPlayerCharacters?.filter(
                                            nonPlayerCharacter => !existingNonPlayerCharactersToAdd.includes(
                                                nonPlayerCharacter.id
                                            )
                                        ).length ? 'Available NPCs' : 'No available NPCs'
                                        }
                                    </Typography>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <List style={{ width: '100%' }}>
                                        {availableNonPlayerCharacters?.filter(
                                            nonPlayerCharacter => !existingNonPlayerCharactersToAdd.includes(
                                                nonPlayerCharacter.id
                                            )
                                        )?.map((nonPlayerCharacter, index) => {
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

                    <Grid item xs={12}>
                        <Typography id="chaos-factor-slider" gutterBottom>
                            Chaos Factor
                        </Typography>
                        <Slider
                            key={`slider-${chaosFactor}`}
                            defaultValue={chaosFactor}
                            step={1}
                            min={1}
                            max={9}
                            marks={chaosFactorOptions}
                            onChange={handleChangeChaosFactor}
                        />
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
