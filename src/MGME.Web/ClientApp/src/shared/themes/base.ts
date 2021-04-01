import { createMuiTheme } from '@material-ui/core/styles';

/*
TODO:

Refine colors
*/

export const base = createMuiTheme({
    palette: {
        primary: {
            light: '#695c99',
            main: '#524878'
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
