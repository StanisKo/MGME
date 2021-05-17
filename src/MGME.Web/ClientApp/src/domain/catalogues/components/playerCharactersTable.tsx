import { ReactElement, useEffect } from 'react';
import { useSelector } from 'react-redux';

import { PlayerCharacter } from '../interfaces';
import { fetchPlayerCharacters } from '../requests';

import { ApplicationState } from '../../../store';

export const PlayerCharactersTable = (): ReactElement => {
    const playerCharacters: PlayerCharacter[] | null = useSelector(
        (state: ApplicationState) => state.catalogues?.playerCharacters ?? null
    );

    const isAuthorized: boolean = useSelector(
        (store: ApplicationState) => Boolean(store.auth?.token) ?? false
    );

    useEffect(() => {
        (async (): Promise<void> => {
            if (isAuthorized) {
                await fetchPlayerCharacters();
            }
        })();
    }, [isAuthorized]);

    return (
        <div>{playerCharacters?.length} characters</div>
    );
};
