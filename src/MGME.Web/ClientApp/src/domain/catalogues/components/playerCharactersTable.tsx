import { ReactElement, useEffect } from 'react';
import { useSelector } from 'react-redux';

import { PlayerCharacter } from '../interfaces';
import { fetchPlayerCharacters } from '../requests';

// import { HeadCell } from '../../../shared/interfaces';

import { ApplicationState } from '../../../store';

import { LinearProgress } from '@material-ui/core';

// Change the response to Adventure if 1 or count of them; same for npcs
// const headCells: HeadCell[] = [
//     { label: 'Name', sorting: 'name', numeric: false },
//     { label: 'Adventure Count', sorting: 'adventure', numeric: true },
//     { label: 'NPC Count', sorting: 'npc', numeric: true }
// ];

export const PlayerCharactersTable = (): ReactElement | null => {
    const playerCharacters: PlayerCharacter[] | null = useSelector(
        (state: ApplicationState) => state.catalogues?.playerCharacters ?? null
    );

    const isAuthorized: boolean = useSelector(
        (store: ApplicationState) => Boolean(store.auth?.token) ?? false
    );

    useEffect(() => {
        (async (): Promise<void> => {
            if (isAuthorized && playerCharacters === null) {
                await fetchPlayerCharacters();
            }
        })();
    }, [isAuthorized, playerCharacters]);

    return playerCharacters !== null ? (
        <div>{playerCharacters?.length} characters</div>
    ) : <LinearProgress />; // Change for skeleton
};

