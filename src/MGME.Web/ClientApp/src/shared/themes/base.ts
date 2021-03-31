import { createMuiTheme } from '@material-ui/core/styles';

/*
TODO:

Refine colors
*/

export const base = createMuiTheme({
    palette: {
        primary: {
            main: '#39305c',
            light: '#524878'
        },
        secondary: {
            main: '#077b8a'
        }
    },
    overrides: {
        MuiButton: {
            containedPrimary: {
                backgroundColor: '#524878',
                '&:hover': {
                    backgroundColor: '#39305c'
                }
            }
        }
    }
});
