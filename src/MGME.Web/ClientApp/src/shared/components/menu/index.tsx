import { ReactElement, useState, ChangeEvent, MouseEvent } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';

import { logoutUser } from '../../../domain/auth/requests';

import { menuOptions } from './helpers';
import { history } from '../../utils';

import { AppBar, Toolbar, Tabs, Tab, IconButton, Menu, MenuItem } from '@material-ui/core';

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

export const MenuBar = (): ReactElement | null => {
    const userLoggedIn = localStorage.getItem('userLoggedIn');

    // Here we actually depend on the store, since we need dynamic rerender on login
    const tokenIsAvaialable = useSelector((store: ApplicationState) => store.auth?.token ?? null);

    const activeMenu = menuOptions.indexOf(
        window.location.pathname.replace('/', '')
    );

    const [selectedMenu, setSelectedMenu] = useState<number>(activeMenu === -1 ? 0 : activeMenu);

    const handleChange = (event: ChangeEvent<unknown>, newValue: number): void => {
        setSelectedMenu(newValue);
    };

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    const handleMenu = (event: MouseEvent<HTMLElement>): void => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = (): void => {
        setAnchorEl(null);
    };

    const handleLogout = (): void => {
        (async (): Promise<void> => {
            const response = await logoutUser();

            if (response.success) {
                history.push(ROUTES.LOGIN);

                return;
            }

            // Handle
        })();
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
                <>
                    <IconButton
                        aria-label="account of current user"
                        aria-controls="menu-appbar"
                        aria-haspopup="true"
                        onClick={handleMenu}
                        color="inherit"
                    >
                        <AccountCircle />
                    </IconButton>
                    <Menu
                        id="menu-appbar"
                        anchorEl={anchorEl}
                        anchorOrigin={{
                            vertical: 'top',
                            horizontal: 'right'
                        }}
                        keepMounted
                        transformOrigin={{
                            vertical: 'top',
                            horizontal: 'right'
                        }}
                        open={open}
                        onClose={handleClose}
                    >
                        <MenuItem>Profile</MenuItem>
                        <MenuItem onClick={handleLogout}>Logout</MenuItem>
                    </Menu>
                </>
            </Toolbar>
        </AppBar>
    ) : null;
};
