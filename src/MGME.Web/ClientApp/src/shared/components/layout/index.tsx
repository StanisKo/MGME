import { ReactElement } from 'react';

import { AppBar, Toolbar, Typography, IconButton } from '@material-ui/core';

import MenuIcon from '@material-ui/icons/Menu';
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
        title: {
            flexGrow: 1
        }
    })
);

export const MenuBar = (): ReactElement => {
    const { root, menuButton, title } = useStyles();

    return (
        <div className={root}>
            <AppBar position="static">
                <Toolbar>
                    <IconButton
                        edge="start"
                        className={menuButton}
                        color="inherit"
                        aria-label="menu"
                    >
                        <MenuIcon />
                    </IconButton>
                    <Typography variant="h6" className={title}>
                        MGME
                    </Typography>
                    <IconButton
                        aria-label="account of current user"
                        aria-controls="menu-appbar"
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
