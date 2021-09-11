import { ReactElement } from 'react';

import { Scene } from '../interfaces';

import { resolveScene } from '../requests';

import {
    Typography,
    Grid,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Button
} from '@material-ui/core';

import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

interface SceneProps {
    adventureId: number;
    scene: Scene;
    classes: { [key: string]: string };
}

export const SceneAccordion = ({ adventureId, scene, classes }: SceneProps): ReactElement => {

    const handleResolve = async (): Promise<void> => {
        await resolveScene(adventureId, scene.id);
    };

    return (
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

                    <Grid item xs={12} className={classes.toRight}>
                        <Button onClick={handleResolve} variant="outlined" color="primary">
                            Resolve
                        </Button>
                    </Grid>

                </Grid>
            </AccordionDetails>
        </Accordion>
    );
};
