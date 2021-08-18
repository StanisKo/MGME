import { ReactElement, useEffect } from 'react';
import { useSelector } from 'react-redux';

import { ApplicationState } from '../../../store';

import { AdventureDetail } from '../interfaces';
import { fetchAdventure } from '../requests';

import { Scene } from '../../scene/interfaces';
import { fetchScenes } from '../../scene/requests';

import { parseIDFromURL } from '../../../shared/helpers';

import {
    Theme,
    Paper,
    Grid,
    Typography,
    Tooltip,
    AppBar,
    Toolbar,
    CircularProgress
} from '@material-ui/core';

import { createStyles, makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        centered: {
            display: 'flex',
            justifyContent: 'center'
        },
        withTooltip: {
            cursor: 'pointer'
        },
        appBar: {
            backgroundColor: 'transparent',
            borderRadius: '5px'
        },
        toolBar: {
            display: 'flex',
            flexDirection: 'column'
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

    const { centered, withTooltip, appBar, toolBar } = useStyles();

    useEffect(() => {
        (async (): Promise<void> => {
            const adventureId = parseIDFromURL();

            if (isAuthorized) {
                await fetchAdventure(adventureId);

                await fetchScenes(adventureId);
            }
        })();
    }, [isAuthorized]);

    return (
        <div className={centered}>
            <Paper elevation={0} className={centered}>
                {adventure && scenes ? (
                    <Grid container justifyContent="center">

                        <Grid container item xs={12}>
                            <Grid item xs={1}>
                                <AppBar position="sticky" className={appBar}>
                                    <Toolbar className={toolBar}>
                                        <Typography>
                                            chaos factor
                                        </Typography>
                                        <Typography>
                                            npc
                                        </Typography>
                                        <Typography>
                                            threads
                                        </Typography>
                                    </Toolbar>
                                </AppBar>
                            </Grid>

                            <Grid item xs={10}>
                                <Tooltip title={adventure.context} className={withTooltip}>
                                    <Typography align="center" variant="h5" component="h5">
                                        {adventure.title}
                                    </Typography>
                                </Tooltip>
                            </Grid>

                            <Grid item xs={1}>

                            </Grid>
                        </Grid>

                        <div style={{height: '1000px'}}>debug</div>
                    </Grid>
                ) : (
                    <CircularProgress />
                )}
            </Paper>
        </div>
    );
};
