import { ReactElement } from 'react';

import { Scene } from '../interfaces';

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
    scene: Scene;
    classes: { [key: string]: string };
}

export const SceneAccordion = ({ scene, classes }: SceneProps): ReactElement => {
    return (
        <Accordion className={classes.accordion} key={scene.id}>
            <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls={`scene-${scene.id}-content`}
                id={`scene-${scene.id}-content`}
            >
                <Typography style={{ fontStyle: 'italic' }}>
                    {scene.title}
                </Typography>
            </AccordionSummary>
            <AccordionDetails>
                <Grid container spacing={2}>

                    <Grid item xs={12}>
                        <Typography align="left">
                            {scene.setup}
                        </Typography>
                    </Grid>

                    <Grid item xs={12} className={classes.toRight}>
                        <Button variant="outlined" color="primary">
                            Resolve
                        </Button>
                    </Grid>

                </Grid>
            </AccordionDetails>
        </Accordion>
    );
};
