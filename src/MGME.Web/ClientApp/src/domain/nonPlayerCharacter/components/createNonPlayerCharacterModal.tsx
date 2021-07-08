import { ReactElement, useState, ChangeEvent, Dispatch, SetStateAction } from 'react';
import { useSelector } from 'react-redux';

import { ApplicationState } from '../../../store';

import { NonPlayerCharacter } from '../interfaces';

import { PlayerCharacter } from '../../playerCharacter/interfaces';

import { BaseServiceResponse } from '../../../shared/interfaces';
import { INPUT_TYPE } from '../../../shared/const';

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


export const CreateNonPlayerCharacterModal = ({
    handleDialogClose, classes, setResponse, setOpenSnackBar }: Props): ReactElement => {

    const playerCharacters: PlayerCharacter[] | null = useSelector(
        (state: ApplicationState) => state.catalogues?.playerCharacters?.data ?? null
    );

    // Used explicitly for input validation
    const nonPlayerCharacters: NonPlayerCharacter[] | null = useSelector(
        (state: ApplicationState) => state.catalogues?.nonPlayerCharacters?.data ?? null
    );

    const [displayedPlayerCharacters, setDisplayedPlayerCharacters] = useState<PlayerCharacter[]>([]);

    const [playerCharacterToAdd, setPlayerCharacterToAdd] = useState<number>(0);

    const [nonPlayerCharacterNames, setNonPlayerCharacterNames] = useState<string[]>([]);

    const [name, setName] = useState<string>('');
    const [nameError, setNameError] = useState<boolean>(false);
    const [nameHelperText, setNameHelperText] = useState<string>('');

    const [description, setDescription] = useState<string>('');

    const handleInputChange = (event: ChangeEvent<HTMLInputElement>): void => {
        const inputType = Number(event.target.attributes.getNamedItem('inputtype')?.value);

        const value = event.target.value;

        switch (inputType) {
            case INPUT_TYPE.ENTITY_NAME:
                if (value.length < 1) {
                    setNameError(true);
                    setNameHelperText('Please provide NPC name');

                    break;
                }

                // This doesn't cover npc names outside of what is currently displayed on the page
                if (nonPlayerCharacterNames?.includes(value.trim().toLowerCase())) {
                    setNameError(true);
                    setNameHelperText('NPC with such name already exists');

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
        }
    };

    const { root } = useStyles();

    return (
        <Dialog
            open={true}
            onClose={handleDialogClose}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
        >
            <DialogTitle id="alert-dialog-title" className={classes.centered}>
                Create NPC
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
