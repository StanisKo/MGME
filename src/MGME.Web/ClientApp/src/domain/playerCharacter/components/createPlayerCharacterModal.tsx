import { ReactElement, useState, useEffect, ChangeEvent } from 'react';

import { AvailableNonPlayerCharacter, Pagination, NewEntityToAdd } from '../../../shared/interfaces';
import { fetchAvailableNonPlayerCharacters } from '../../../shared/requests';
import { INPUT_TYPE, NON_PLAYER_CHARACTER_FILTER } from '../../../shared/const';

import {
    Dialog,
    DialogTitle,
    DialogContent,
    Grid,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    FormHelperText,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    List,
    ListItem,
    ListItemText,
    TablePagination,
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

    const [name, setName] = useState<string>('');
    const [nameError, setNameError] = useState<boolean>(false);
    const [nameHelperText, setNameHelperText] = useState<string>('');

    const [description, setDescription] = useState<string>('');

    console.log(description);

    const [newThreadsToAdd, setNewThreadsToAdd] = useState<NewEntityToAdd[]>([]);

    const [newNonPlayerCharactersToAdd, setNewNonPlayerChartersToAdd] = useState<NewEntityToAdd[]>([]);

    const [existingNonPlayerCharactersToAdd, setExistingNonPlayerCharactersToAdd] = useState<number[]>([]);

    // We paginate list of available entities
    const [pagination, setPagination] = useState<Pagination>({} as Pagination);
    const [page, setPage] = useState(0);

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
        handleDialogClose();
    };

    const allowedToCreate =
        name
        && !nameError
        && newThreadsToAdd.length
        && existingNonPlayerCharactersToAdd.length;

    useEffect(() => {
        (async (): Promise<void> => {
            if (!availableNonPlayerCharacters) {
                const availableNonPlayerCharacters = await fetchAvailableNonPlayerCharacters(
                    NON_PLAYER_CHARACTER_FILTER.AVAILABLE_FOR_PLAYER_CHARACTERS
                );
    
                setAvailableNonPlayerCharacters(availableNonPlayerCharacters.data);
                setPagination(availableNonPlayerCharacters.pagination);
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
                        <FormControl className={classes.formControl} style={{ width: '100%' }}>
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
                        <FormControl className={classes.formControl} style={{ width: '100%' }}>
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
                                        {availableNonPlayerCharacters?.length ? 'Available NPCs' : 'No available NPCs'}
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
