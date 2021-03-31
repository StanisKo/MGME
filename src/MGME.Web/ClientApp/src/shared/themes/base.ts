import { createMuiTheme } from '@material-ui/core/styles';

/*
TODO:

Refine colors
*/

export const base = createMuiTheme({
    palette: {
        primary: {
            main: '#39305c'
        },
        secondary: {
            main: '#077b8a'
        }
    },
    overrides: {
        MuiButton: {
            containedPrimary: {
                backgroundColor: '#695c99',
                '&:hover': {
                    backgroundColor: '#524878'
                }
            }
        }
    }
});
