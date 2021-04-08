import { createMuiTheme } from '@material-ui/core/styles';

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
        // kudos to: https://codepen.io/AgnusDei/pen/NWPbOxL
        MuiPaper: {
            elevation0: {
                display: 'flex',
                width: '97.5%',
                top: '0%',
                left: '50%',
                margin: '2em 0',
                padding: '3em',
                boxShadow: '1px 1px 10px #262626, 0 0 60px #8a4d0f inset',
                background: '#fffef0'
            }
        }
    }
});
