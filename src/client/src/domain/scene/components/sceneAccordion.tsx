import { ReactElement, useState, ChangeEvent } from 'react';
import { useSelector } from 'react-redux';

import { ApplicationState } from '../../../store';

import { Scene } from '../interfaces';
import { resolveScene } from '../requests';

import { AdventureDetail } from '../../adventure/interfaces';
import { chaosFactorOptions } from '../../adventure/helpers';
import { updateAdventure } from '../../adventure/requests';

import {
    Typography,
    Grid,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Button,
    Slider,
    Tooltip
} from '@material-ui/core';

import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

interface SceneProps {
    scene: Scene;
    classes: { [key: string]: string };
}

export const SceneAccordion = ({ scene, classes }: SceneProps): ReactElement | null => {
    const adventure: AdventureDetail | null = useSelector(
        (store: ApplicationState) => store.adventureDetail?.adventureData ?? null
    );

    const [resolveIsRequested, setResolveIsRequested] = useState<boolean>(false);

    const [chaosFactor, setChaosFactor] = useState<number>(adventure?.chaosFactor ?? 5);

    const [chaosFactorIsOutOfBounds, setChaosFactorIsOutOfBounds] = useState<boolean>(false);

    const requestResolve = (): void => {
        setResolveIsRequested(true);
    };

    const cancelResolve = (): void => {
        setResolveIsRequested(false);
    };

    const handleChangeChaosFactor = (event: ChangeEvent<unknown>, value: number | number[]): void => {
        const newChaosFactor = value as number;

        // Check necessary only for TS compiler; on time of execution we know adventure is there
        if (adventure) {

            if (newChaosFactor < adventure.chaosFactor - 1 || newChaosFactor > adventure.chaosFactor + 1) {
                setChaosFactorIsOutOfBounds(true);
            }
            else {
                setChaosFactorIsOutOfBounds(false);
            }

        }

        setChaosFactor(newChaosFactor);

        /*
        What's up Material UI?
        C:617 Uncaught TypeError: Cannot read property 'getBoundingClientRect' of null
        */
        console.clear();
    };

    const handleResolve = async (): Promise<void> => {
        if (adventure) {
            await updateAdventure({ id: adventure.id, chaosFactor: chaosFactor });

            await resolveScene(adventure.id, scene.id);

            setResolveIsRequested(false);
        }
    };

    return adventure ? (
        <Accordion className={classes.accordion} key={scene.id}>
            <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls={`scene-${scene.id}-content`}
                id={`scene-${scene.id}-content`}
            >
                <Typography style={{ fontStyle: 'italic' }}>
                    {scene.randomEvent ? `${scene.title}. Seed — ${scene.randomEvent}` : scene.title}
                </Typography>
            </AccordionSummary>
            <AccordionDetails>
                <Grid container spacing={4}>

                    <Grid item xs={12}>
                        <Typography align="left">
                            {scene.setup}
                        </Typography>
                    </Grid>

                    <Grid item xs={12} className={resolveIsRequested ? classes.centered : classes.toRight}>
                        {resolveIsRequested ? (
                            <>
                                <Button
                                    onClick={cancelResolve}
                                    variant="outlined"
                                    color="primary"
                                    disabled={scene.resolved}
                                >
                                    Cancel
                                </Button>
                                <Tooltip
                                    title={
                                        chaosFactorIsOutOfBounds
                                            // eslint-disable-next-line max-len
                                            ? 'Chaos Factor cannot be less or more than 1 step from current'
                                            : 'Adjust the Chaos Factor before resolving the scene'
                                    }
                                >
                                    {/* TODO: The UX should be rethought */}
                                    <Slider
                                        style={{ margin: '0 2em 0 2em' }}
                                        key={`slider-${adventure.chaosFactor}`}
                                        defaultValue={adventure.chaosFactor}
                                        step={1}
                                        min={1}
                                        max={9}
                                        marks={chaosFactorOptions}
                                        onChange={handleChangeChaosFactor}
                                    />
                                </Tooltip>
                                <Button
                                    onClick={handleResolve}
                                    variant="outlined"
                                    color="primary"
                                    disabled={
                                        scene.resolved
                                            || chaosFactor === adventure.chaosFactor || chaosFactorIsOutOfBounds
                                    }
                                >
                                    Resolve
                                </Button>
                            </>
                        ) : (
                            <Button
                                onClick={requestResolve}
                                variant="outlined"
                                color="primary"
                                disabled={scene.resolved}
                            >
                                Resolve
                            </Button>
                        )}
                    </Grid>

                </Grid>
            </AccordionDetails>
        </Accordion>
    ) : null;
};
