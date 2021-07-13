// import { ReactElement, useState, Dispatch, SetStateAction } from 'react';
// import { useSelector } from 'react-redux';

// import { ApplicationState } from '../../../store';

// import { Adventure } from '../interfaces';

// import { BaseServiceResponse } from '../../../shared/interfaces';

// import { AvailableNonPlayerCharacter } from '../../nonPlayerCharacter/interfaces';

// import {
//     Dialog,
//     DialogTitle,
//     DialogContent,
//     Grid,
//     TextField,
//     Accordion,
//     AccordionSummary,
//     AccordionDetails,
//     List,
//     ListItem,
//     ListItemText,
//     LinearProgress,
//     DialogActions,
//     Button,
//     Typography
// } from '@material-ui/core';

// import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';

// import clsx from 'clsx';

// const useStyles = makeStyles((theme: Theme) =>
//     createStyles({
//         root: {
//             '& label.Mui-error': {
//                 color: theme.palette.secondary.main
//             },
//             '& .Mui-error': {
//                 '& fieldset': {
//                     borderColor: '#077b8a !important'
//                 }
//             },
//             '& .MuiFormHelperText-root': {
//                 color: theme.palette.secondary.main
//             }
//         }
//     })
// );

// interface Props {
//     handleDialogClose: () => void;
//     classes: { [key: string]: string };
//     setResponse: Dispatch<SetStateAction<BaseServiceResponse>>;
//     setOpenSnackBar: Dispatch<SetStateAction<boolean>>;
// }

// export const CreateAdventureModal = (
//     { handleDialogClose, classes, setResponse, setOpenSnackBar }: Props): ReactElement => {

//     /*
//     Used exclusively to extract names and deny ui interaction
//     if name of a new adventure already exists
//     */
//     const adventures: Adventure[] | null = useSelector(
//         (state: ApplicationState) => state.adventures?.dataset?.data ?? null
//     );

//     /*
//     Original collection of npcs that are available for adding. Acts as a source of truth
//     from which characters can be added back to what we display
//     */
//     const [availableNonPlayerCharacters, setAvailableNonPlayerCharacters] = useState<AvailableNonPlayerCharacter[]>();

//     /*
//     A replica of original npc collection that is modified via ui interaction:
//     via it we show what we add or remove to/from the list avialable npcs
//     */
//     const [displayedAvailableNonPlayerCharacters, setDisplayedAvailableNonPlayerCharacters] =
//         useState<AvailableNonPlayerCharacter[]>();

//     const [title, setTitle] = useState<string>('');
//     const [titleError, setNameError] = useState<boolean>(false);
//     const [nameHelperText, setNameHelperText] = useState<string>('');

//     const { root } = useStyles();

//     return <div></div>;
// };

export {};

