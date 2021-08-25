import { ReactElement, useEffect } from 'react';
import { useSelector } from 'react-redux';

import { ApplicationState } from '../../../store';

import { AdventureDetail } from '../interfaces';
import { fetchAdventure } from '../requests';

import { determineChaosFactorIconComponent } from '../helpers';

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
    CircularProgress
} from '@material-ui/core';

import { StartBattleIcon, FateQuestionIcon, ThreadListIcon } from './icons';

import PeopleRoundedIcon from '@material-ui/icons/PeopleRounded';
import AddRoundedIcon from '@material-ui/icons/AddRounded';

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
        // ?
        main: {
            // minHeight: '25vh'
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

    const { centered, main, appBar, toolBar, buttonElement } = useStyles();

    useEffect(() => {
        (async (): Promise<void> => {
            const adventureId = parseIDFromURL();

            if (isAuthorized) {
                await fetchAdventure(adventureId);

                await fetchScenes(adventureId, 1);
            }
        })();
    }, [isAuthorized]);

    return (
        <div className={centered}>
            <Paper elevation={0} className={centered}>
                {adventure && scenes ? (

                    // Main Container
                    <Grid container className={main}>
                        
                        {
                        /*
                        Fate question icon should be D20
                        */
                        }
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
                                                <span>
                                                    {determineChaosFactorIconComponent(adventure.chaosFactor)}
                                                </span>
                                            </Tooltip>
                                        </IconButton>

                                        <IconButton
                                            color="primary"
                                            size="medium"
                                            aria-label="modify-npcs"
                                            className={buttonElement}
                                        >
                                            <Tooltip title="Modify NPCs">
                                                <PeopleRoundedIcon fontSize="large" />
                                            </Tooltip>
                                        </IconButton>

                                        <IconButton
                                            color="primary"
                                            size="medium"
                                            aria-label="modify-threads"
                                            className={buttonElement}
                                        >
                                            <Tooltip title="Modify Threads">
                                                <span>
                                                    <ThreadListIcon />
                                                </span>
                                            </Tooltip>
                                        </IconButton>
                                    </Toolbar>
                                </AppBar>
                            </Sticky>
                        </Grid>

                        {/* Scenes */}
                        <Grid item container justifyContent="center" xs={10}>
                            
                            {/* Margins, etc; get rid of min height, work on controls first, then work on main */}
                            <Typography align="center" variant="h5" component="h5">
                                {adventure.title}
                            </Typography>

                            <Typography align="center" variant="h6" component="h6">
                                {adventure.context}
                            </Typography>

                            <Grid item container xs={12} justifyContent="center" direction="column">
                                {scenes.map((scene: Scene) => {
                                    return <div key={scene.id} style={{ margin: '1em' }}>{scene.title}</div>;
                                })}
                            </Grid>
                        </Grid>

                        {/* Right Control */}
                        <Grid item xs={1}>
                            <Sticky>
                                <AppBar className={appBar}>
                                    <Toolbar className={toolBar}>
                                        <IconButton
                                            color="primary"
                                            size="medium"
                                            aria-label="add-scene"
                                            className={buttonElement}
                                        >
                                            <Tooltip title="Add New Scene">
                                                <AddRoundedIcon fontSize="large" />
                                            </Tooltip>
                                        </IconButton>

                                        <IconButton
                                            color="primary"
                                            size="medium"
                                            aria-label="ask-fate-question"
                                            className={buttonElement}
                                        >
                                            <Tooltip title="Ask Fate Question">
                                                <span>
                                                    <FateQuestionIcon />
                                                </span>
                                            </Tooltip>
                                        </IconButton>

                                        <IconButton
                                            color="primary"
                                            size="medium"
                                            aria-label="start battle"
                                            className={buttonElement}
                                        >
                                            <Tooltip title="Start Battle">
                                                <span>
                                                    <StartBattleIcon />
                                                </span>
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
