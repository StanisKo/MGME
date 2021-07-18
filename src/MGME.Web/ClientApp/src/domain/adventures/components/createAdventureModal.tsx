import { ReactElement, useState, Dispatch, SetStateAction, ChangeEvent } from 'react';
import { useSelector } from 'react-redux';

import { ApplicationState } from '../../../store';

import { Adventure } from '../interfaces';

import { BaseServiceResponse, NewEntityToAdd } from '../../../shared/interfaces';

import { AvailableNonPlayerCharacter } from '../../nonPlayerCharacter/interfaces';

import { INPUT_TYPE } from '../../../shared/const';

import {
    Dialog,
    DialogTitle,
    DialogContent,
    Grid,
    TextField,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    List,
    ListItem,
    ListItemText,
    LinearProgress,
    DialogActions,
    Button,
    Typography
} from '@material-ui/core';

import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';

import clsx from 'clsx';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            '& label.Mui-error': {
                color: theme.palette.secondary.main
            },
            '& .Mui-error': {
                '& fieldset': {
                    borderColor: '#077b8a !important'
                }
            },
            '& .MuiFormHelperText-root': {
                color: theme.palette.secondary.main
            }
        }
    })
);

interface Props {
    handleDialogClose: () => void;
    classes: { [key: string]: string };
    setResponse: Dispatch<SetStateAction<BaseServiceResponse>>;
    setOpenSnackBar: Dispatch<SetStateAction<boolean>>;
}

export const CreateAdventureModal = (
    { handleDialogClose, classes, setResponse, setOpenSnackBar }: Props): ReactElement => {

    /*
    Used exclusively to extract names and deny ui interaction
    if name of a new adventure already exists
    */
    const adventures: Adventure[] | null = useSelector(
        (state: ApplicationState) => state.adventures?.dataset?.data ?? null
    );

    /*
    Original collection of npcs that are available for adding. Acts as a source of truth
    from which characters can be added back to what we display
    */
    const [availableNonPlayerCharacters, setAvailableNonPlayerCharacters] = useState<AvailableNonPlayerCharacter[]>();

    /*
    A replica of original npc collection that is modified via ui interaction:
    via it we show what we add or remove to/from the list avialable npcs
    */
    const [displayedAvailableNonPlayerCharacters, setDisplayedAvailableNonPlayerCharacters] =
        useState<AvailableNonPlayerCharacter[]>();

    const [title, setTitle] = useState<string>('');
    const [titleError, setTitleError] = useState<boolean>(false);
    const [titleHelperText, setTitleHelperText] = useState<string>('');

    const [context, setContext] = useState<string>('');

    const [threadName, setThreadName] = useState<string>('');
    const [threadError, setThreadError] = useState<boolean>(false);
    const [threadHelperText, setThreadHelperText] = useState<string>('');

    const [threadDescription, setThreadDescription] = useState<string>('');

    // Collection of threads to add to new adventure
    const [threadsToAdd, setThreadsToAdd] = useState<NewEntityToAdd[]>([]);

    const [nonPlayerCharacterName, setNonPlayerCharacterName] = useState<string>('');
    const [nonPlayerCharacterError, setNonPlayerCharacterError] = useState<boolean>(false);
    const [nonPlayerCharacterHelperText, setNonPlayerCharacterHelperText] = useState<string>('');

    const [nonPlayerCharacterDescription, setNonPlayerCharacterDescription] = useState<string>('');

    // A collection of newly created npcs that we actually send to the API
    const [newNonPlayerCharactersToAdd, setNewNonPlayerCharactersToAdd] = useState<NewEntityToAdd[]>([]);

    // A pool of newly created and existing npcs that are displayed to the user
    const [displayedNonPlayerCharactersToAdd, setDisplayedNonPlayerCharactersToAdd] =
        useState<NewEntityToAdd[]>([]);

    // A collection of existing npcs' ids that we actually send to the API
    const [existingNonPlayerCharactersToAdd, setExistingNonPlayerCharactersToAdd] = useState<number[]>([]);

    // Takes part in validing names of freshly created npcs
    const [adventureNames, setAdventureNames] = useState<string[]>([]);

    const [nonPlayerCharacterNames, setNonPlayerCharacterNames] = useState<string[]>([]);

    const { root } = useStyles();

    const handleInputChange = (event: ChangeEvent<HTMLInputElement>): void => {
        const inputType = Number(event.target.attributes.getNamedItem('inputtype')?.value);

        const value = event.target.value;

        const normalizedInput = value.trim().toLowerCase();

        switch (inputType) {
            case INPUT_TYPE.ENTITY_NAME:
                if (normalizedInput.length < 1) {
                    setTitleError(true);
                    setTitleHelperText('Please provide character name');

                    break;
                }

                // This doesn't cover adventur  names outside of what is currently displayed on the page
                if (adventureNames?.includes(normalizedInput)) {
                    setTitleError(true);
                    setTitleHelperText('Character with such name already exists');

                    break;
                }

                setTitle(value);

                setTitleError(false);
                setTitleHelperText('');

                break;

            // We don't need to validate context, it's up to the user to provide it or not
            case INPUT_TYPE.ENTITY_DESCRIPTION:
                setContext(value);

                break;

            case INPUT_TYPE.THREAD_NAME:
                setThreadName(value);

                const threadAlreadyExists = threadsToAdd.map(thread => thread.name.toLowerCase()).includes(
                    normalizedInput
                );

                if (threadAlreadyExists) {
                    setThreadError(true);
                    setThreadHelperText('Such thread already exists');

                    break;
                }

                setThreadError(false);
                setThreadHelperText('');

                break;

            case INPUT_TYPE.THREAD_DESCRIPTION:
                setThreadDescription(value);

                break;

            case INPUT_TYPE.NON_PLAYER_CHARACTER_NAME:
                setNonPlayerCharacterName(value);

                const nonPlayerCharacterAlreadyExists = nonPlayerCharacterNames.map(
                    name => name.toLowerCase()
                ).includes(
                    normalizedInput
                );

                if (nonPlayerCharacterAlreadyExists) {
                    setNonPlayerCharacterError(true);
                    setNonPlayerCharacterHelperText('Such NPC already exists');

                    break;
                }

                setNonPlayerCharacterError(false);
                setNonPlayerCharacterHelperText('');

                break;

            case INPUT_TYPE.NON_PLAYER_CHARACTER_DESCRIPTION:
                setNonPlayerCharacterDescription(value);

                break;

        }
    };

    return <div></div>;
};
