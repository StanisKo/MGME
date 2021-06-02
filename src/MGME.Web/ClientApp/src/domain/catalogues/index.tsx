import { ReactElement, useState, ChangeEvent } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { ApplicationState } from '../../store';
import { actionCreators } from '../../store/shared';

import { PlayerCharactersTable } from '../playerCharacter/components/playerCharactersTable';

import { deletePlayerCharacters } from '../playerCharacter/requests';

import { AvailableNonPlayerCharacter, PaginatedDataServiceResponse } from '../../shared/interfaces';
import { fetchAvailableNonPlayerCharacters } from '../../shared/requests';

import { entityNames } from './helpers';

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
    LinearProgress
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

type TData = PaginatedDataServiceResponse<AvailableNonPlayerCharacter[]>;

export const Catalogues = (): ReactElement => {
    const dispatch = useDispatch();

    const selectedEntities = useSelector(
        (store: ApplicationState) => store.catalogues?.playerCharacters?.selected ?? []
    );

    const [selectedMenu, setSelectedMenu] = useState<number>(SELECTED_MENU.PLAYER_CHARACTERS);

    const [dialogOpen, setDialogOpen] = useState<boolean>(false);

    const [availableNonPlayerCharacters, setAvailableNonPlayerCharacters] = useState<TData>();

    const [name, setName] = useState<string>('');
    const [nameError, setNameError] = useState<boolean>(false);
    const [nameHelperText, setNameHelperText] = useState<string>('');

    const allowedToCreate = name && !nameError;

    const handleChange = (event: ChangeEvent<{ value: unknown }>): void => {
        setSelectedMenu(event.target.value as number);
    };

    const handleDelete = async (): Promise<void> => {
        await deletePlayerCharacters(selectedEntities);

        dispatch(
            actionCreators.updateStore(
                {
                    type: 'UPDATE_STORE',
                    reducer: 'catalogues',
                    key: 'playerCharacters',
                    payload: {
                        selected: []
                    }
                }
            )
        );
    };

    const handleDialogOpen = async (): Promise<void> => {
        if (!availableNonPlayerCharacters) {
            const availableNonPlayerCharacters = await fetchAvailableNonPlayerCharacters();

            setAvailableNonPlayerCharacters(availableNonPlayerCharacters);
        }

        setDialogOpen(true);
    };
    
    const handleDialogClose = (): void => {
        setDialogOpen(false);
    };

    const handleInputChange = (event: ChangeEvent<HTMLInputElement>): void => {
        const value = event.target.value;

        setName(value);

        if (value.length < 1) {
            setNameError(true);
            setNameHelperText('Please provide character name');
        }
        else {
            setNameError(false);
            setNameHelperText('');
        }
    };

    console.log(name);

    const handleCreate = async (): Promise<void> => {
        setDialogOpen(false);
    };

    const nothingSelected = selectedEntities.length === 0;

    const relatedEntities = entityNames[selectedMenu ? selectedMenu + 1 : selectedMenu - 1];

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
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField
                                error={nameError}
                                helperText={nameHelperText}
                                variant="outlined"
                                required
                                fullWidth
                                label="Name"
                                onChange={handleInputChange}
                                className={root}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                variant="outlined"
                                fullWidth
                                label="Description"
                            />
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
                                            {availableNonPlayerCharacters.data.length ? `Available ${relatedEntities}s` : `No available ${relatedEntities}s`}
                                        </Typography>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        <List style={{ width: '100%' }}>
                                            {availableNonPlayerCharacters.data.map((nonPlayerCharacter, index) => {
                                                return (
                                                    <ListItem key={`avaialable-npc-${index}`} button>
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
