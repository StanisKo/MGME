import { ReactElement, useState, ChangeEvent, MouseEvent } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import { logoutUser } from '../../domain/auth/requests';

import { LogoutUser } from '../../store/reducers/auth';

import { AppBar, Toolbar, Tabs, Tab, IconButton, Menu, MenuItem, Theme } from '@material-ui/core';

import AccountCircle from '@material-ui/icons/AccountCircle';

import { createStyles, makeStyles } from '@material-ui/core/styles';
import { ApplicationState } from '../../store';
import { ROUTES } from '../const';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        flexGrow: {
            flexGrow: 1
        }
    })
);

export const MenuBar = (): ReactElement | null => {
    const history = useHistory();

    // Here we depend on the store, since we need dynamic rerender on login
    const tokenIsAvaialable = useSelector((store: ApplicationState) => store.auth?.token ?? null);

    const dispatch = useDispatch();

    const activeMenu = [ROUTES.CATALOGUES, ROUTES.ADVENTURES].indexOf(
        history.location.pathname
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

    const goToProfile = (): void => {
        history.push(ROUTES.USER_PROFILE);
        setAnchorEl(null);
    };

    const handleLogout = (): void => {
        (async (): Promise<void> => {
            await logoutUser();

            localStorage.removeItem('userLoggedIn');

            history.push(ROUTES.LOGIN);

            setAnchorEl(null);

            // We also clear out store since menu render depends on it
            dispatch<LogoutUser>(
                {
                    type: 'LOGOUT_USER'
                }
            );
        })();
    };

    const { flexGrow } = useStyles();

    return tokenIsAvaialable ? (
        <AppBar position="static" color="primary">
            <Toolbar>
                <Tabs
                    className={flexGrow}
                    centered
                    value={selectedMenu}
                    onChange={handleChange}
                    aria-label="menu-tabs"
                    indicatorColor="secondary"
                >
                    <Tab
                        label="Catalogues"
                        component={Link}
                        to={ROUTES.CATALOGUES}
                        disableRipple={true}
                    />
                    <Tab
                        label="Adventures"
                        component={Link}
                        to={ROUTES.ADVENTURES}
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
                        <MenuItem onClick={goToProfile}>Profile</MenuItem>
                        <MenuItem onClick={handleLogout}>Logout</MenuItem>
                    </Menu>
                </>
            </Toolbar>
        </AppBar>
    ) : null;
};
