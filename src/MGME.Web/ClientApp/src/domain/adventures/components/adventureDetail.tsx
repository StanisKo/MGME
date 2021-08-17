import { ReactElement, useEffect } from 'react';

import { parseIDFromURL } from '../../../shared/helpers';

export const AdventureDetail = (): ReactElement => {

    useEffect(() => {
        const adventureId = parseIDFromURL();

        console.log(adventureId);
    }, []);

    return (
        <div>Adventure Detail</div>
    );
};
