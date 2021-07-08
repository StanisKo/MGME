import { ReactElement, useState, ChangeEvent } from 'react';
import { useSelector } from 'react-redux';

import { ApplicationState } from '../../../store';

import { NonPlayerCharacter } from '../interfaces';

import { PlayerCharacter } from '../../playerCharacter/interfaces';

import { INPUT_TYPE } from '../../../shared/const';


export const CreateNonPlayerCharacterModal = (): ReactElement => {

    const playerCharacters: PlayerCharacter[] | null = useSelector(
        (state: ApplicationState) => state.catalogues?.playerCharacters?.data ?? null
    );

    // Used explicitly for input validation
    const nonPlayerCharacters: NonPlayerCharacter[] | null = useSelector(
        (state: ApplicationState) => state.catalogues?.nonPlayerCharacters?.data ?? null
    );

    const [displayedPlayerCharacters, setDisplayedPlayerCharacters] = useState<PlayerCharacter[]>([]);

    const [playerCharacterToAdd, setPlayerCharacterToAdd] = useState<number>(0);

    const [nonPlayerCharacterNames, setNonPlayerCharacterNames] = useState<string[]>([]);

    const [name, setName] = useState<string>('');
    const [nameError, setNameError] = useState<boolean>(false);
    const [nameHelperText, setNameHelperText] = useState<string>('');

    const [description, setDescription] = useState<string>('');

    const handleInputChange = (event: ChangeEvent<HTMLInputElement>): void => {
        const inputType = Number(event.target.attributes.getNamedItem('inputtype')?.value);

        const value = event.target.value;

        switch (inputType) {
            case INPUT_TYPE.ENTITY_NAME:
                if (value.length < 1) {
                    setNameError(true);
                    setNameHelperText('Please provide NPC name');

                    break;
                }

                // This doesn't cover npc names outside of what is currently displayed on the page
                if (nonPlayerCharacterNames?.includes(value.trim().toLowerCase())) {
                    setNameError(true);
                    setNameHelperText('NPC with such name already exists');

                    break;
                }

                setName(value);

                setNameError(false);
                setNameHelperText('');

                break;

            // We don't need to validate description, it's up to the user to provide it or not
            case INPUT_TYPE.ENTITY_DESCRIPTION:
                setDescription(value);

                break;
        }
    };

    return <div></div>;
};
