import { ReactElement, useEffect } from 'react';
import { useSelector } from 'react-redux';

import { ApplicationState } from '../../../store';

import { AdventureDetail } from '../interfaces';
import { fetchAdventure } from '../requests';

import { determineChaosFactorIconComponent, returnCalledComponent } from '../helpers';

import { Scene } from '../../scene/interfaces';
import { fetchScenes } from '../../scene/requests';

import { parseIDFromURL } from '../../../shared/helpers';

import {
    Theme,
    Paper,
    Grid,
    Typography,
    AppBar,
    Toolbar,
    IconButton,
    Tooltip,
    CircularProgress,
    Accordion,
    AccordionSummary,
    AccordionDetails
} from '@material-ui/core';

import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

import { StartBattleIcon, FateQuestionIcon, ThreadListIcon, AddNewSceneIcon, ModifyNPCIcon } from './icons';

import { createStyles, makeStyles } from '@material-ui/core/styles';

// Bless you: https://github.com/gm0t/react-sticky-el
import Sticky from 'react-sticky-el';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        centered: {
            display: 'flex',
            justifyContent: 'center'
        },
        withTooltip: {
            cursor: 'pointer'
        },
        main: {
            minHeight: '35vh'
        },
        appBar: {
            backgroundColor: 'transparent',
            boxShadow: '0 0 0 0',
            paddingTop: '2em'
        },
        toolBar: {
            display: 'flex',
            flexDirection: 'column'
        },
        buttonElement: {
            marginTop: '0.5em',
            marginBottom: '0.5em'
        },
        accordion: {
            backgroundColor: 'transparent',
            boxShadow: '0 0 0 0',
            border: '1px solid rgba(80, 80, 80, 0.1)'
        }
    })
);

export const AdventureDetailPage = (): ReactElement => {
    const isAuthorized: boolean = useSelector(
        (store: ApplicationState) => Boolean(store.auth?.token) ?? false
    );

    const adventure: AdventureDetail | null = useSelector(
        (store: ApplicationState) => store.adventureDetail?.adventureData ?? null
    );

    const scenes: Scene[] | null = useSelector(
        (store: ApplicationState) => store.adventureDetail?.scenes?.data ?? null
    );

    const { centered, main, appBar, toolBar, buttonElement, accordion } = useStyles();

    useEffect(() => {
        (async (): Promise<void> => {
            const adventureId = parseIDFromURL();

            if (isAuthorized) {
                await fetchAdventure(adventureId);

                await fetchScenes(adventureId, 1);
            }
        })();
    }, [isAuthorized]);

    // Can't create new scenes if there are unresolved scenes
    const canAddNewScene = scenes && scenes.length ? scenes.some(scene => !scene.resolved) : true;

    return (
        <div className={centered}>
            <Paper elevation={0} className={centered}>
                {adventure && scenes ? (

                    // Main Container
                    <Grid container className={main}>
                        {/* Left Control */}
                        <Grid item xs={1}>
                            <Sticky>
                                <AppBar className={appBar}>
                                    <Toolbar className={toolBar}>
                                        <IconButton
                                            color="primary"
                                            size="medium"
                                            aria-label="chaos-factor"
                                            className={buttonElement}
                                        >
                                            <Tooltip title={`Chaos Factor: ${adventure.chaosFactor}`}>
                                                {determineChaosFactorIconComponent(adventure.chaosFactor)}
                                            </Tooltip>
                                        </IconButton>

                                        <Tooltip title="Modify NPCs">
                                            <IconButton
                                                color="primary"
                                                size="medium"
                                                aria-label="modify-npcs"
                                                className={buttonElement}
                                            >
                                                <ModifyNPCIcon />
                                            </IconButton>
                                        </Tooltip>

                                        <IconButton
                                            color="primary"
                                            size="medium"
                                            aria-label="modify-threads"
                                            className={buttonElement}
                                        >
                                            <Tooltip title="Modify Threads">
                                                {returnCalledComponent(ThreadListIcon)}
                                            </Tooltip>
                                        </IconButton>
                                    </Toolbar>
                                </AppBar>
                            </Sticky>
                        </Grid>

                        {/* Scenes */}
                        <Grid item container justifyContent="center" xs={10}>
                            <Grid item xs={12}>
                                <Typography align="center" variant="h5" component="h5">
                                    {adventure.title}
                                </Typography>
                            </Grid>

                            <Grid item xs={12}>
                                <Accordion className={accordion}>
                                    <AccordionSummary
                                        expandIcon={<ExpandMoreIcon />}
                                        aria-controls="adventure-context"
                                        id="adventure-context"
                                    >
                                        <Typography style={{ fontStyle: 'italic' }}>
                                            Context
                                        </Typography>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        <Typography align="center">
                                            {adventure.context}
                                        </Typography>
                                    </AccordionDetails>
                                </Accordion>
                            </Grid>
                        </Grid>

                        {/* Right Control */}
                        <Grid item xs={1}>
                            <Sticky>
                                <AppBar className={appBar}>
                                    <Toolbar className={toolBar}>
                                        <Tooltip title="Add New Scene">
                                            <IconButton
                                                color="primary"
                                                size="medium"
                                                aria-label="add-scene"
                                                className={buttonElement}
                                                disabled={!canAddNewScene}
                                            >
                                                <AddNewSceneIcon disabled={!canAddNewScene} />
                                            </IconButton>
                                        </Tooltip>

                                        <IconButton
                                            color="primary"
                                            size="medium"
                                            aria-label="ask-fate-question"
                                            className={buttonElement}
                                        >
                                            <Tooltip title="Ask Fate Question">
                                                {returnCalledComponent(FateQuestionIcon)}
                                            </Tooltip>
                                        </IconButton>

                                        <IconButton
                                            color="primary"
                                            size="medium"
                                            aria-label="start battle"
                                            className={buttonElement}
                                        >
                                            <Tooltip title="Start Battle">
                                                {returnCalledComponent(StartBattleIcon)}
                                            </Tooltip>
                                        </IconButton>
                                    </Toolbar>
                                </AppBar>
                            </Sticky>
                        </Grid>

                    </Grid>
                ) : (
                    <CircularProgress />
                )}
            </Paper>
        </div>
    );
};
