import { ReactElement, useEffect } from 'react';
import { useSelector } from 'react-redux';

import { ApplicationState } from '../../../store';

import { NonPlayerCharacter } from '../interfaces';
import { fetchNonPlayerCharacters } from '../requests';

export const NonPlayerCharactersTable = (): ReactElement => {
    const isAuthorized: boolean = useSelector(
        (store: ApplicationState) => Boolean(store.auth?.token) ?? false
    );

    const nonPlayerCharacters: NonPlayerCharacter[] | null = useSelector(
        (state: ApplicationState) => state.catalogues?.nonPlayerCharacters?.data ?? null
    );

    // Initial request
    useEffect(() => {
        (async (): Promise<void> => {
            if (isAuthorized && nonPlayerCharacters === null) {
                await fetchNonPlayerCharacters();
            }
        })();
    }, [isAuthorized, nonPlayerCharacters]);

    return (
        <div>NPC Table</div>
    );
};
