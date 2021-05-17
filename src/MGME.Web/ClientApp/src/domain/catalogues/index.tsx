import { ReactElement, useState, ChangeEvent } from 'react';

import { Paper, Tabs, Tab, Theme } from '@material-ui/core';

import { createStyles, makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        centered: {
            display: 'flex',
            justifyContent: 'center'
        },
        flexGrow: {
            flexGrow: 1
        }
    })
);

export const Catalogues = (): ReactElement => {
    const [selectedMenu, setSelectedMenu] = useState<number>(0);

    const handleChange = (event: ChangeEvent<unknown>, newValue: number): void => {
        setSelectedMenu(newValue);
    };

    const { centered, flexGrow } = useStyles();

    return (
        <div className={centered}>
            <Paper elevation={0}>
                <Tabs
                    className={flexGrow}
                    centered
                    value={selectedMenu}
                    onChange={handleChange}
                    aria-label="menu-tabs"
                    indicatorColor="primary"
                >
                    <Tab label="Player Characters" disableRipple={true}/>
                    <Tab label="Non Player Characters" disableRipple={true}/>
                </Tabs>
            </Paper>
        </div>
    );
};
