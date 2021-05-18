import { ReactElement, useState, ChangeEvent } from 'react';

import { PlayerCharactersTable } from './components/playerCharactersTable';

import { Paper, Grid, FormControl, Select, MenuItem, Button, Theme } from '@material-ui/core';

import { createStyles, makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
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

export const Catalogues = (): ReactElement => {
    const [selectedMenu, setSelectedMenu] = useState<number>(0);

    const handleChange = (event: ChangeEvent<{ value: unknown }>): void => {
        setSelectedMenu(event.target.value as number);
    };

    const { centered, formControl, buttons, deleteButton } = useStyles();

    return (
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
                        >
                            Add to Adventure
                        </Button>
                        <Button
                            variant="outlined"
                            color="primary"
                            size="medium"
                        >
                            Add to Character
                        </Button>
                        <Button
                            variant="outlined"
                            color="primary"
                            size="medium"
                        >
                            Create
                        </Button>
                        <Button
                            variant="outlined"
                            color="primary"
                            size="medium"
                            className={deleteButton}
                        >
                            Remove
                        </Button>
                    </Grid>

                    <Grid item xs={12}>
                        {selectedMenu === 0 && <PlayerCharactersTable />}
                    </Grid>
                </Grid>
            </Paper>
        </div>
    );
};
