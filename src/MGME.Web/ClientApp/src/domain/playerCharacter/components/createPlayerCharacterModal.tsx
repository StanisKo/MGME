import { ReactElement, useState, useEffect, ChangeEvent } from 'react';

import { createPlayerCharacter } from '../requests';

import { AvailableNonPlayerCharacter, NewEntityToAdd } from '../../../shared/interfaces';
import { fetchAvailableNonPlayerCharacters } from '../../../shared/requests';
import { INPUT_TYPE, NON_PLAYER_CHARACTER_FILTER } from '../../../shared/const';

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
}

export const CreatePlayerCharacterModal = ({ handleDialogClose, classes }: Props): ReactElement => {
    const [availableNonPlayerCharacters, setAvailableNonPlayerCharacters] = useState<AvailableNonPlayerCharacter[]>();

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

    const [threadsToAdd, setThreadsToAdd] = useState<NewEntityToAdd[]>([]);

    const [nonPlayerCharacterName, setNonPlayerCharacterName] = useState<string>('');
    const [nonPlayerCharacterError, setNonPlayerCharacterError] = useState<boolean>(false);
    const [nonPlayerCharacterHelperText, setNonPlayerCharacterHelperText] = useState<string>('');

    const [nonPlayerCharacterDescription, setNonPlayerCharacterDescription] = useState<string>('');

    const [newNonPlayerCharactersToAdd, setNewNonPlayerCharactersToAdd] = useState<NewEntityToAdd[]>([]);

    const [displayedNonPlayerCharactersToAdd, setDisplayedNonPlayerCharactersToAdd] =
        useState<NewEntityToAdd[]>([]);

    const [existingNonPlayerCharactersToAdd, setExistingNonPlayerCharactersToAdd] = useState<number[]>([]);

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

                const nonPlayerCharacterAlreadyExists = displayedNonPlayerCharactersToAdd.map(
                    nonPlayerCharacter => nonPlayerCharacter.name
                ).includes(
                    value.trim()
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
        await createPlayerCharacter(
            {
                name: name,
                description: description,
                threads: threadsToAdd,
                newNonPlayerCharacters: newNonPlayerCharactersToAdd,
                existingNonPlayerCharacters: existingNonPlayerCharactersToAdd
            }
        );

        handleDialogClose();
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
