import { ReactElement, useState, useEffect, ChangeEvent } from 'react';

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

    const [threadsToAdd, seThreadsToAdd] = useState<NewEntityToAdd[]>([]);

    // const [newNonPlayerCharactersToAdd, setNewNonPlayerChartersToAdd] = useState<NewEntityToAdd[]>([]);

    console.log(description);

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
        }
    };

    const handleRemovingthreadsToAdd = (name: string) => (): void => {
        seThreadsToAdd(
            threadsToAdd?.filter(
                thread => thread.name !== name
            )
        );
    };

    const handleRemovingNewNonPlayerCharactersToAdd = (name: string) => (): void => {
        setDisplayedNonPlayerCharactersToAdd(
            displayedNonPlayerCharactersToAdd?.filter(
                nonPlayerCharacter => nonPlayerCharacter.name !== name
            )
        );

        const availableNonPlayerCharacterToAddBack = availableNonPlayerCharacters?.find(
            nonPlayerCharacter => nonPlayerCharacter.name === name
        );

        if (displayedAvailableNonPlayerCharacters) {
            setDisplayedAvailableNonPlayerCharacters(
                [
                    ...displayedAvailableNonPlayerCharacters,
                    // We know it's there, otherwise list wouldn't render in the first place
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    availableNonPlayerCharacterToAddBack!
                ]
            );
        }
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

        // Remove npc from list of displayed available npcs
        setDisplayedAvailableNonPlayerCharacters(
            availableNonPlayerCharacters?.filter(
                nonPlayerCharacter => nonPlayerCharacter.id !== id
            )
        );
    };

    const handleCreate = async (): Promise<void> => {
        handleDialogClose();
    };

    const allowedToCreate =
        name
        && !nameError
        && threadsToAdd.length
        && existingNonPlayerCharactersToAdd.length;

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
                                                onClick={handleRemovingthreadsToAdd(
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
                                                onClick={handleRemovingNewNonPlayerCharactersToAdd(
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
                            <Accordion disabled={displayedAvailableNonPlayerCharacters?.length === 0}>
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
