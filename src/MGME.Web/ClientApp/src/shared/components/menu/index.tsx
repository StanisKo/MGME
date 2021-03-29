import { ReactElement, useState, ChangeEvent } from 'react';
import { useSelector } from 'react-redux';

import { AppBar, Toolbar, Tabs, Tab, IconButton } from '@material-ui/core';

import AccountCircle from '@material-ui/icons/AccountCircle';

import { createStyles, makeStyles } from '@material-ui/core/styles';
import { ApplicationState } from '../../../store';

const useStyles = makeStyles(() =>
    createStyles({
        flexGrow: {
            flexGrow: 1
        }
    })
);

export const Menu = (): ReactElement | null => {
    const userLoggedIn = localStorage.getItem('userLoggedIn');

    // Here we actually depend on the store, since we need dynamic rerender
    const tokenIsAvaialable = useSelector((store: ApplicationState) => store.auth?.token ?? null);

    const [selectedMenu, setSelectedMenu] = useState<number>(0);

    const handleChange = (event: ChangeEvent<unknown>, newValue: number): void => {
        setSelectedMenu(newValue);
    };

    const { flexGrow } = useStyles();

    return userLoggedIn || tokenIsAvaialable ? (
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
            </Toolbar>
        </AppBar>
    ) : null;
};
