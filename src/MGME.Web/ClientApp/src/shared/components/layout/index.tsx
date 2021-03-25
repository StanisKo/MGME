import { ReactElement, useState, ChangeEvent } from 'react';

import { AppBar, Toolbar, Tabs, Tab, IconButton } from '@material-ui/core';

import AccountCircle from '@material-ui/icons/AccountCircle';

import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            flexGrow: 1
        },
        menuButton: {
            marginRight: theme.spacing(2)
        },
        menuItems: {
            flexGrow: 1
        }
    })
);

export const MenuBar = (): ReactElement => {
    const [selectedMenu, setSelectedMenu] = useState<number>(0);

    const handleChange = (event: ChangeEvent<unknown>, newValue: number): void => {
        setSelectedMenu(newValue);
    };

    const { root, menuItems } = useStyles();

    return (
        <div className={root}>
            <AppBar position="static">
                <Toolbar>
                    <Tabs
                        className={menuItems}
                        centered
                        value={selectedMenu}
                        onChange={handleChange}
                        aria-label="disabled tabs example"
                    >
                        <Tab label="Item One" />
                        <Tab label="Item Two" />
                        <Tab label="Item Three" />
                    </Tabs>
                    <IconButton
                        aria-label="account of current user"
                        aria-controls="menu-bar"
                        aria-haspopup="true"
                        color="inherit"
                    >
                        <AccountCircle />
                    </IconButton>
                </Toolbar>
            </AppBar>
        </div>
    );
};
