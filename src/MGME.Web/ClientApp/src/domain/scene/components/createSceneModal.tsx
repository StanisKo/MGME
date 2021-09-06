import { ReactElement, useState, useEffect, ChangeEvent, Dispatch, SetStateAction } from 'react';
import { useSelector } from 'react-redux';

import { ApplicationState } from '../../../store';

import { Scene } from '../interfaces';

import { createScene } from '../requests';

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
    adventureId: number;
    adventureChaosFactor: number;
}

export const CreateNonPlayerCharacterModal = (
    {
        handleDialogClose,
        classes,
        setResponse,
        setOpenSnackBar,
        adventureId,
        adventureChaosFactor
    }: Props): ReactElement => {

    // Used exclusively for input validation
    const scenes: Scene[] | null = useSelector(
        (state: ApplicationState) => state.adventureDetail.scenes?.data ?? null
    );

    const [sceneTitles, setSceneTitles] = useState<string[]>([]);

    const [title, setTitle] = useState<string>('');
    const [titleError, setTitleError] = useState<boolean>(false);
    const [titleHelperText, setTitleHelperText] = useState<string>('');

    const [setup, setSetup] = useState<string>('');
    const [setupError, setSetupError] = useState<boolean>(false);
    const [setupHelperText, setSetupHelperText] = useState<string>('');

    const [expanded, setExpanded] = useState<boolean>(false);

    const handleInputChange = (event: ChangeEvent<HTMLInputElement>): void => {
        const inputType = Number(event.target.attributes.getNamedItem('inputtype')?.value);

        const value = event.target.value;

        const normalizedInput = value.trim().toLowerCase();

        switch (inputType) {
            case INPUT_TYPE.ENTITY_NAME:
                if (normalizedInput.length < 1) {
                    setTitleError(true);
                    setTitleHelperText('Please provide scene title');

                    break;
                }

                // This doesn't cover scene titles outside of what is currently displayed on the page
                if (sceneTitles?.includes(normalizedInput)) {
                    setTitleError(true);
                    setTitleHelperText('Scene with such title already exists');

                    break;
                }

                setTitle(value);

                setTitleError(false);
                setTitleHelperText('');

                break;

            case INPUT_TYPE.ENTITY_DESCRIPTION:
                if (normalizedInput.length < 1) {
                    setSetupError(true);
                    setSetupHelperText('Please provide scene setup');

                    break;
                }

                setSetup(value);

                setSetupError(false);
                setSetupHelperText('');

                break;
        }
    };

    const handleCreate = async (): Promise<void> => {
        const response = await createScene(
            {
                title: title.trim(),
                setup: setup.trim(),
                adventureId: adventureId,
                // We only provide chaos factor if it's not the first scene
                ...(scenes.length > 1 ? { adventureChaosFactor: adventureChaosFactor } : null)
            }
        );

        setResponse(response);

        setOpenSnackBar(true);

        if (response.success) {
            handleDialogClose();
        }
    };

    useEffect(() => {
        if (scenes) {
            setSceneTitles(
                scenes.map(scene => scene.title.toLowerCase())
            );
        }
    }, [scenes]);

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
