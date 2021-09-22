import { ReactElement, useState, useEffect, SyntheticEvent } from 'react';
import { useSelector } from 'react-redux';

import { ApplicationState } from '../../../store';

import { AdventureDetail } from '../interfaces';
import { fetchAdventure } from '../requests';

import { determineChaosFactorIconComponent } from '../helpers';

import { Scene } from '../../scene/interfaces';
import { CreateSceneModal, SceneAccordion } from '../../scene/components';
import { fetchScenes } from '../../scene/requests';

import { BaseServiceResponse, Pagination } from '../../../shared/interfaces';
import { Alert } from '../../../shared/components';
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
    AccordionDetails,
    Snackbar,
    Box,
    TablePagination
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
        toRight: {
            display: 'flex',
            justifyContent: 'flex-end'
        },
        withTooltip: {
            cursor: 'pointer'
        },
        main: {
            minHeight: '35vh'
        },
        buttons: {
            '& button': {
                margin: '0 .5em 0 .5em'
            }
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

// TODO: Disable scene creation if all scenes are resolved AND there are more pages than 1

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

    const pagination: Pagination | null = useSelector(
        (store: ApplicationState) => store.adventureDetail?.scenes?.pagination ?? null
    );

    const [adventureId, setAdventureId] = useState<number>(0);

    const [dialogOpen, setDialogOpen] = useState<boolean>(false);

    const [openSnackbar, setOpenSnackbar] = useState<boolean>(false);

    const [response, setResponse] = useState<BaseServiceResponse>({} as BaseServiceResponse);

    const [page, setPage] = useState(0);

    const handleDialogOpen = (): void => {
        setDialogOpen(true);
    };

    const handleDialogClose = (): void => {
        setDialogOpen(false);
    };

    const handleSnackbarClose = (event?: SyntheticEvent, reason?: string): void => {
        if (reason === 'clickaway') {
            return;
        }

        setOpenSnackbar(false);
    };

    const handlePageChange = (event: unknown, newPage: number): void => {
        setPage(newPage);
    };

    useEffect(() => {
        (async (): Promise<void> => {
            const adventureId = parseIDFromURL();

            setAdventureId(adventureId);

            if (isAuthorized) {
                await fetchAdventure(adventureId);

                await fetchScenes(adventureId);
            }
        })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAuthorized]);

    useEffect(() => {
        (async (): Promise<void> => {
            if (isAuthorized && scenes !== null) {
                await fetchScenes(adventureId, page + 1);
            }
        })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page]);

    /*
    API returns last page, since paging for scenes is reversed
    Therefore, we also bring UI in sync (since it doesn't know about last page on render)
    */
    useEffect(() => {
        if (pagination) {
            setPage(pagination.page - 1);
        }
    }, [pagination]);

    const currentPageCanFitMoreScenes = scenes?.length !== 15 ?? true;

    // Can create new scenes only if all scenes are resolved and we're on a page that can still fit new scenes
    const canAddNewScene = (scenes?.every(scene => scene.resolved) && currentPageCanFitMoreScenes) || true;

    const { main, appBar, toolBar, buttonElement, ...classes } = useStyles();

    return (
        <>
            <div className={classes.centered}>
                <Paper elevation={0} className={classes.centered}>
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

                                            <Tooltip title="Modify Threads">
                                                <IconButton
                                                    color="primary"
                                                    size="medium"
                                                    aria-label="modify-threads"
                                                    className={buttonElement}
                                                >
                                                    <ThreadListIcon />
                                                </IconButton>
                                            </Tooltip>
                                        </Toolbar>
                                    </AppBar>
                                </Sticky>
                            </Grid>

                            {/* Scenes */}
                            <Grid item container justifyContent="center" xs={10} spacing={4}>
                                <Grid item xs={12}>
                                    <Typography align="center" variant="h5" component="h5">
                                        {adventure.title}
                                    </Typography>
                                </Grid>

                                <Grid item xs={12}>
                                    <Accordion className={classes.accordion}>
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

                                <Grid item xs={12} container spacing={2}>
                                    {(scenes && scenes.length) ? scenes.map(scene => {
                                        return (
                                            <Grid item xs={12} key={`scene-${scene.id}`}>
                                                <SceneAccordion
                                                    scene={scene}
                                                    classes={classes as unknown as { [key: string]: string }}
                                                />
                                            </Grid>
                                        );
                                    }) : null}
                                </Grid>

                                <Grid item xs={12}>
                                    {scenes?.length ? (
                                        <Box mt={2}>
                                            <TablePagination
                                                component="div"
                                                rowsPerPage={15}
                                                rowsPerPageOptions={[]}
                                                count={pagination?.numberOfResults ?? 0}
                                                page={page}
                                                onPageChange={handlePageChange}
                                            />
                                        </Box>
                                    ) : null}
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
                                                    onClick={handleDialogOpen}
                                                >
                                                    <AddNewSceneIcon disabled={!canAddNewScene} />
                                                </IconButton>
                                            </Tooltip>

                                            <Tooltip title="Ask Fate Question">
                                                <IconButton
                                                    color="primary"
                                                    size="medium"
                                                    aria-label="ask-fate-question"
                                                    className={buttonElement}
                                                    /*
                                                    Can ask fate question only if there is active (unresolved scene)
                                                    Opposite of when user can create new scene
                                                    */
                                                    disabled={canAddNewScene}
                                                >
                                                    <FateQuestionIcon disabled={canAddNewScene} />
                                                </IconButton>
                                            </Tooltip>

                                            <Tooltip title="Start Battle">
                                                <IconButton
                                                    color="primary"
                                                    size="medium"
                                                    aria-label="start battle"
                                                    className={buttonElement}
                                                    /*
                                                    Can start battle only if there is active (unresolved scene)
                                                    Opposite of when user can create new scene
                                                    */
                                                    disabled={canAddNewScene}
                                                >
                                                    <StartBattleIcon disabled={canAddNewScene} />
                                                </IconButton>
                                            </Tooltip>
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

            {adventure && dialogOpen && (
                <CreateSceneModal
                    handleDialogClose={handleDialogClose}
                    classes={classes as unknown as { [key: string]: string }}
                    setResponse={setResponse}
                    setOpenSnackBar={setOpenSnackbar}
                    adventureId={adventureId}
                    adventureChaosFactor={adventure.chaosFactor}
                />
            )}

            <Snackbar open={openSnackbar} onClose={handleSnackbarClose}>
                <Alert
                    onClose={handleSnackbarClose}
                    severity={response.success ? 'success' : 'warning'}
                >
                    {response.message}
                </Alert>
            </Snackbar>
        </>
    );
};
