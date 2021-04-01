import { ReactElement, useState, useReducer, useEffect, ChangeEvent, MouseEvent } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import { logoutUser } from '../../../domain/auth/requests';

import { actionCreators } from '../../../store/reducers/auth';

import { AppBar, Toolbar, Tabs, Tab, IconButton, Menu, MenuItem, Theme } from '@material-ui/core';

import AccountCircle from '@material-ui/icons/AccountCircle';

import { createStyles, makeStyles } from '@material-ui/core/styles';
import { ApplicationState } from '../../../store';
import { ROUTES } from '../../const';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        flexGrow: {
            flexGrow: 1
        }
    })
);

export const MenuBar = (): ReactElement | null => {
    const history = useHistory();

    const userLoggedIn = localStorage.getItem('userLoggedIn');

    // Here we actually depend on the store, since we need dynamic rerender on login
    const tokenIsAvaialable = useSelector((store: ApplicationState) => store.auth?.token ?? null);

    const dispatch = useDispatch();

    const activeMenu = [ROUTES.ITEM_ONE, ROUTES.ITEM_TWO, ROUTES.ITEM_THREE].indexOf(
        history.location.pathname
    );

    const [selectedMenu, setSelectedMenu] = useState<number>(activeMenu === -1 ? 0 : activeMenu);

    const [, forceUpdate] = useReducer(x => x + 1, 0);

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
            await logoutUser();

            localStorage.removeItem('userLoggedIn');

            history.push(ROUTES.LOGIN);

            setAnchorEl(null);

            // We also clear out store since menu render depends on it
            dispatch(
                actionCreators.logoutUser(
                    {
                        type: 'LOGOUT_USER'
                    }
                )
            );
        })();
    };

    useEffect(() => {
        if (!tokenIsAvaialable) {
            forceUpdate();
        }
    }, [tokenIsAvaialable]);

    const { flexGrow } = useStyles();

    // But we still use localStorage to speed up re-renders
    return userLoggedIn || tokenIsAvaialable ? (
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
