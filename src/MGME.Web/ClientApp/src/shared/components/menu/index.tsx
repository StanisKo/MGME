import { ReactElement, useState, ChangeEvent } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';

import { AppBar, Toolbar, Tabs, Tab, IconButton } from '@material-ui/core';

import AccountCircle from '@material-ui/icons/AccountCircle';

import { createStyles, makeStyles } from '@material-ui/core/styles';
import { ApplicationState } from '../../../store';
import { ROUTES } from '../../const';

const useStyles = makeStyles(() =>
    createStyles({
        flexGrow: {
            flexGrow: 1
        }
    })
);

export const Menu = (): ReactElement | null => {
    const userLoggedIn = localStorage.getItem('userLoggedIn');

    // Here we actually depend on the store, since we need dynamic rerender on login
    const tokenIsAvaialable = useSelector((store: ApplicationState) => store.auth?.token ?? null);

    const [selectedMenu, setSelectedMenu] = useState<number>(0);

    const handleChange = (event: ChangeEvent<unknown>, newValue: number): void => {
        setSelectedMenu(newValue);
    };

    const { flexGrow } = useStyles();

    // But we still use localStorage to speed up re-renders
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
                    <Tab
                        label="Item One"
                        component={Link}
                        to={ROUTES.ITEM_ONE}
                        disableRipple={true}
                    />
                    <Tab
                        label="Item Two"
                        component={Link}
                        to={ROUTES.ITEM_TWO}
                        disableRipple={true}
                    />
                    <Tab
                        label="Item Three"
                        component={Link}
                        to={ROUTES.ITEM_THREE}
                        disableRipple={true}
                    />
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
