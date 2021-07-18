import { ReactElement, useState, useEffect, Dispatch, SetStateAction, ChangeEvent } from 'react';
import { useSelector } from 'react-redux';

import { ApplicationState } from '../../../store';

import { Adventure } from '../interfaces';

import { BaseServiceResponse, NewEntityToAdd } from '../../../shared/interfaces';
import { INPUT_TYPE, NON_PLAYER_CHARACTER_FILTER } from '../../../shared/const';

import { AvailablePlayerCharacter } from '../../playerCharacter/interfaces';
import { fetchAvailablePlayerCharacters } from '../../playerCharacter/requests';

import { AvailableNonPlayerCharacter } from '../../nonPlayerCharacter/interfaces';
import { fetchAvailableNonPlayerCharacters } from '../../nonPlayerCharacter/requests';

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

    // A collection of player characters that are available for adding
    const [availablePlayerCharacters, setAvailablePlayerCharacters] = useState<AvailablePlayerCharacter[]>();

    // A collection of player characters' ids that we send to API
    const [playerCharactersToAdd, setPlayerCharactersToAdd] = useState<number[]>([]);

    // A collection of npcs that are available for adding
    const [availableNonPlayerCharacters, setAvailableNonPlayerCharacters] = useState<AvailableNonPlayerCharacter[]>();

    // A collection of existing npcs' ids that we send to the API
    const [existingNonPlayerCharactersToAdd, setExistingNonPlayerCharactersToAdd] = useState<number[]>([]);

    // A collection of newly created npcs that we send to the API
    const [newNonPlayerCharactersToAdd, setNewNonPlayerCharactersToAdd] = useState<NewEntityToAdd[]>([]);

    // A pool of newly created and existing npcs that are displayed to the user
    const [displayedNonPlayerCharactersToAdd, setDisplayedNonPlayerCharactersToAdd] =
        useState<NewEntityToAdd[]>([]);

    // Takes part in validing names of freshly created npcs
    const [adventureNames, setAdventureNames] = useState<string[]>([]);

    // Takes part in validing names of freshly created/added from existing npcs
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

    const handleAddingThreads = (): void => {
        setThreadsToAdd(
            [...threadsToAdd, { name: threadName, description: threadDescription } as NewEntityToAdd ]
        );

        setThreadName('');

        if (threadDescription) {
            setThreadDescription('');
        }
    };

    const handleRemovingThreads = (name: string) => (): void => {
        setThreadsToAdd(
            threadsToAdd?.filter(
                thread => thread.name !== name
            )
        );
    };

    const handleAddingNewNonPlayerCharacters = (): void => {
        // Set what we show
        setDisplayedNonPlayerCharactersToAdd(
            [
                ...displayedNonPlayerCharactersToAdd,
                { name: nonPlayerCharacterName, description: nonPlayerCharacterDescription } as NewEntityToAdd
            ]
        );

        // Set what we send
        setNewNonPlayerCharactersToAdd(
            [
                ...newNonPlayerCharactersToAdd,
                { name: nonPlayerCharacterName, description: nonPlayerCharacterDescription } as NewEntityToAdd
            ]
        );

        // Clean up
        setNonPlayerCharacterName('');

        if (nonPlayerCharacterDescription) {
            setNonPlayerCharacterDescription('');
        }
    };

    const handleRemovingNewNonPlayerCharacters = (name: string) => (): void => {
        // Remove from what we show
        setDisplayedNonPlayerCharactersToAdd(
            displayedNonPlayerCharactersToAdd.filter(
                nonPlayerCharacter => nonPlayerCharacter.name !== name
            )
        );

        /*
        If it is one of the available NPCs, add it back
        by removing from the list of ids we send to api
        */
        const availableNonPlayerCharacterToAddBack = availableNonPlayerCharacters?.find(
            nonPlayerCharacter => nonPlayerCharacter.name === name
        );

        if (availableNonPlayerCharacterToAddBack) {
            setExistingNonPlayerCharactersToAdd(
                existingNonPlayerCharactersToAdd.filter(
                    id => id !== availableNonPlayerCharacterToAddBack.id
                )
            );

            return;
        }

        // Otherwise it is freshly created NPC -- remove it from what we send
        setNewNonPlayerCharactersToAdd(
            newNonPlayerCharactersToAdd.filter(
                nonPlayerCharacter => nonPlayerCharacter.name !== name
            )
        );
    };

    const handleAddingExistingNonPlayerCharacter = (id: number, name: string) => (): void => {
        // Set what we send
        setExistingNonPlayerCharactersToAdd(
            [...existingNonPlayerCharactersToAdd, id]
        );

        // Set what we show
        setDisplayedNonPlayerCharactersToAdd(
            [
                ...displayedNonPlayerCharactersToAdd,
                { name: name } as NewEntityToAdd
            ]
        );
    };

    const handleCreate = async (): Promise<void> => {
        console.log();
    };

    const allowedToCreate =
        title
        && !titleError
        && threadsToAdd.length
        && playerCharactersToAdd.length
        && (existingNonPlayerCharactersToAdd.length || newNonPlayerCharactersToAdd.length);

    useEffect(() => {
        (async (): Promise<void> => {
            if (!availablePlayerCharacters) {
                const availablePlayerCharacters = await fetchAvailablePlayerCharacters();

                setAvailablePlayerCharacters(availablePlayerCharacters.data);
            }

            if (!availableNonPlayerCharacters) {
                const availableNonPlayerCharacters = await fetchAvailableNonPlayerCharacters(
                    NON_PLAYER_CHARACTER_FILTER.AVAILABLE_FOR_PLAYER_CHARACTERS
                );

                setAvailableNonPlayerCharacters(availableNonPlayerCharacters.data);
            }
        })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (adventures) {
            setAdventureNames(
                adventures?.map(
                    adventure => adventure.title.toLowerCase()
                )
            );
        }
    }, [adventures]);

    return <div></div>;
};
