import { ReactElement, useState, useEffect, ChangeEvent, Dispatch, SetStateAction } from 'react';
import { useSelector } from 'react-redux';

import { ApplicationState } from '../../../store';

import { NonPlayerCharacter } from '../interfaces';

import { createNonPlayerCharacter } from '../requests';

import { PlayerCharacter } from '../../playerCharacter/interfaces';
import { fetchAvailablePlayerCharacters } from '../../playerCharacter/requests';

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

    // Used exclusively for input validation
    const nonPlayerCharacters: NonPlayerCharacter[] | null = useSelector(
        (state: ApplicationState) => state.catalogues?.nonPlayerCharacters?.data ?? null
    );

    const [nonPlayerCharacterNames, setNonPlayerCharacterNames] = useState<string[]>([]);

    const [playerCharacters, setPlayerCharacters] = useState<PlayerCharacter[]>();

    const [playerCharacterToAdd, setPlayerCharacterToAdd] = useState<number>(0);

    const [name, setName] = useState<string>('');
    const [nameError, setNameError] = useState<boolean>(false);
    const [nameHelperText, setNameHelperText] = useState<string>('');

    const [description, setDescription] = useState<string>('');

    const [expanded, setExpanded] = useState<boolean>(false);

    const handleInputChange = (event: ChangeEvent<HTMLInputElement>): void => {
        const inputType = Number(event.target.attributes.getNamedItem('inputtype')?.value);

        const value = event.target.value;

        const normalizedInput = value.trim().toLowerCase();

        switch (inputType) {
            case INPUT_TYPE.ENTITY_NAME:
                if (normalizedInput.length < 1) {
                    setNameError(true);
                    setNameHelperText('Please provide NPC name');

                    break;
                }

                // This doesn't cover npc names outside of what is currently displayed on the page
                if (nonPlayerCharacterNames?.includes(normalizedInput)) {
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

    const handleAddingPlayerCharacter = (id: number) => (): void => {
        // Set what we send
        setPlayerCharacterToAdd(id);

        setExpanded(false);
    };

    const handleCreate = async (): Promise<void> => {
        const response = await createNonPlayerCharacter(
            {
                name: name.trim(),
                description: description.trim(),
                ...(playerCharacterToAdd ? { playerCharacter: playerCharacterToAdd } : null)
            }
        );

        setResponse(response);

        setOpenSnackBar(true);

        if (response.success) {
            handleDialogClose();
        }
    };

    const handleAccordionExpand = (): void => {
        if (playerCharacterToAdd > 0) {
            setPlayerCharacterToAdd(0);
        }

        setExpanded(!expanded);
    };

    useEffect(() => {
        (async (): Promise<void> => {
            if (!playerCharacters) {
                const availablePlayerCharacters = await fetchAvailablePlayerCharacters();

                setPlayerCharacters(availablePlayerCharacters.data);
            }
        })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (nonPlayerCharacters) {
            setNonPlayerCharacterNames(
                nonPlayerCharacters.map(
                    nonPlayerCharacter => nonPlayerCharacter.name.toLowerCase()
                )
            );
        }
    }, [nonPlayerCharacters]);

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
                        {playerCharacters ? (
                            <Accordion
                                expanded={expanded}
                                onChange={handleAccordionExpand}
                            >
                                <AccordionSummary
                                    expandIcon={<ExpandMoreIcon />}
                                    aria-controls="playerCharacters-content"
                                    id="playerCharacter-header"
                                >
                                    {/*
                                    So, this: if user selects character, show character's name
                                    as accordion title; otherwise show strings based on weather
                                    available characters exist
                                    */}
                                    <Typography>
                                        {playerCharacterToAdd > 0 ? playerCharacters?.find(
                                            character => character.id === playerCharacterToAdd
                                        )?.name : playerCharacters?.length
                                            ? 'Available Characters'
                                            : 'No available Characters'
                                        }
                                    </Typography>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <List style={{ width: '100%' }}>
                                        {playerCharacters?.map((playerCharacter, index) => {
                                            return (
                                                <ListItem
                                                    key={`avaialable-character-${index}`}
                                                    button
                                                    onClick={handleAddingPlayerCharacter(
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
                </Grid>
            </DialogContent>
            <DialogActions className={clsx(classes.centered, classes.buttons)}>
                <Button onClick={handleDialogClose} variant="contained" color="secondary">
                    Cancel
                </Button>
                <Button
                    onClick={handleCreate}
                    variant="contained"
                    color="primary"
                    disabled={!name || nameError}
                >
                    Create
                </Button>
            </DialogActions>
        </Dialog>
    );
};
