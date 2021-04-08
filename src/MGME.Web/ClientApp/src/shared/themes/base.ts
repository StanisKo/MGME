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
        },
        MuiPaper: {
            elevation0: {
                background: '#F5F5F5',
                boxShadow: '-6px -6px 20px #FDFDFD, 6px 6px 20px #E4E4E4',
                border: 'solid 2px white',
                borderRadius: '10px',
                margin: '1.4rem 0',
                padding: '1rem 3rem'
            }
        }
    }
});
