import { ReactElement, useState, ChangeEvent } from 'react';

import { URLBuilder } from '../../utils';

import { AppBar, Toolbar, Tabs, Tab, IconButton, Button } from '@material-ui/core';

import AccountCircle from '@material-ui/icons/AccountCircle';

import { createStyles, makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(() =>
    createStyles({
        flexGrow: {
            flexGrow: 1
        }
    })
);

// Rename into menu bar

export const MenuBar = (): ReactElement => {
    const [selectedMenu, setSelectedMenu] = useState<number>(0);

    const handleChange = (event: ChangeEvent<unknown>, newValue: number): void => {
        setSelectedMenu(newValue);
    };

    const { flexGrow } = useStyles();

    return (
        <AppBar position="static">
            <Toolbar>
                <Tabs
                    className={flexGrow}
                    centered
                    value={selectedMenu}
                    onChange={handleChange}
                    aria-label="menu-tabs"
                >
                    <Tab label="Item One" disableRipple={true} />
                    <Tab label="Item Two" disableRipple={true} />
                    <Tab label="Item Three" disableRipple={true} />
                </Tabs>
                <IconButton
                    aria-label="account-of-current-user"
                    aria-controls="menu-bar"
                    aria-haspopup="true"
                    color="inherit"
                >
                    <AccountCircle />
                </IconButton>
                <Button
                    onClick={(): void => {
                        fetch(URLBuilder.buildPOST('auth', 'refresh-token'));
                    }}
                >
                    Test refresh token
                </Button>
            </Toolbar>
        </AppBar>
    );
};
