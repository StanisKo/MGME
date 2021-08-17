import { ReactElement, useEffect } from 'react';
import { useSelector } from 'react-redux';

import { ApplicationState } from '../../../store';

import { AdventureDetail } from '../interfaces';

import { fetchAdventure } from '../requests';

import { parseIDFromURL } from '../../../shared/helpers';

import { LinearProgress } from '@material-ui/core';

// TODO: rename single adventure into adventure detail; think of naming
export const AdventureDetailPage = (): ReactElement => {
    const isAuthorized: boolean = useSelector(
        (store: ApplicationState) => Boolean(store.auth?.token) ?? false
    );

    const adventure: AdventureDetail | null = useSelector(
        (store: ApplicationState) => store.singleAdventure?.adventureData ?? null
    );

    useEffect(() => {
        (async (): Promise<void> => {
            const adventureId = parseIDFromURL();

            if (isAuthorized) {
                await fetchAdventure(adventureId);
            }
        })();
    }, [isAuthorized]);

    return adventure !== null ? (
        <div>{adventure.title}</div>
    ) : <LinearProgress />;
};
