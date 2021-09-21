import { ReactElement, useState, useEffect, ChangeEvent, Dispatch, SetStateAction } from 'react';
import { useSelector } from 'react-redux';

import { ApplicationState } from '../../../store';

import { Scene } from '../interfaces';

import { createScene, requestRandomEvent } from '../requests';

import { BaseServiceResponse } from '../../../shared/interfaces';
import { INPUT_TYPE } from '../../../shared/const';

import {
    Dialog,
    DialogTitle,
    DialogContent,
    Grid,
    TextField,
    DialogActions,
    Button,
    Box,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Typography
} from '@material-ui/core';

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

export const CreateSceneModal = (
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
        (state: ApplicationState) => state.adventureDetail?.scenes?.data ?? null
    );

    const [sceneTitles, setSceneTitles] = useState<string[]>([]);

    const [title, setTitle] = useState<string>('');
    const [titleError, setTitleError] = useState<boolean>(false);
    const [titleHelperText, setTitleHelperText] = useState<string>('');

    const [setup, setSetup] = useState<string>('');
    const [setupError, setSetupError] = useState<boolean>(false);
    const [setupHelperText, setSetupHelperText] = useState<string>('');

    const [randomEvent, setRandomEvent] = useState<string>('');

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

    const handleRequestRandomEvent = async (): Promise<void> => {
        const randomEvent = await requestRandomEvent();

        setRandomEvent(randomEvent);
    };

    const handleCreate = async (): Promise<void> => {
        const response = await createScene(
            {
                title: title.trim(),

                setup: setup.trim(),

                adventureId: adventureId,

                // We only provide chaos factor if it's not the first scene
                ...((scenes ?? []).length > 0 ? { adventureChaosFactor: adventureChaosFactor } : null),

                // If user seeded initial scene with random event, we send it to API as well
                ...(randomEvent ? { randomEvent: randomEvent } : null)
            }
        );

        setResponse(response);

        setOpenSnackBar(true);

        if (response.success) {
            handleDialogClose();

            setRandomEvent('');
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
                Create Scene
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
                            error={setupError}
                            helperText={setupHelperText}
                            variant="outlined"
                            required
                            fullWidth
                            label="Setup"
                            onChange={handleInputChange}
                            inputProps={{ inputtype: INPUT_TYPE.ENTITY_DESCRIPTION }}
                            className={root}
                        />
                    </Grid>

                    {(scenes ?? []).length === 0 && (
                        <Grid item xs={12}>
                            <Accordion expanded={randomEvent.length > 0} disabled={!randomEvent}>
                                <AccordionSummary
                                    aria-controls="random-event"
                                    id="random-event"
                                >
                                    <Typography>
                                        Random Event
                                    </Typography>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <Typography align="center">
                                        {randomEvent}
                                    </Typography>
                                </AccordionDetails>
                            </Accordion>
                        </Grid>
                    )}
                </Grid>
            </DialogContent>
            <Box mt={2}>
                <DialogActions className={clsx(classes.centered, classes.buttons)}>

                    <Button onClick={handleDialogClose} variant="contained" color="secondary">
                        Cancel
                    </Button>

                    {(scenes ?? []).length === 0 && (
                        <Button
                            onClick={handleRequestRandomEvent}
                            variant="outlined"
                            color="primary"
                        >
                            Randomize
                        </Button>
                    )}

                    <Button
                        onClick={handleCreate}
                        variant="contained"
                        color="primary"
                        disabled={!title || titleError || !setup || setupError}
                    >
                        Create
                    </Button>
                </DialogActions>
            </Box>
        </Dialog>
    );
};
