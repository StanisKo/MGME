import { PlayerCharacter } from '../interfaces';
import { URLBuilder, DataController } from '../../../shared/utils';

export const fetchPlayerCharacters = async (page?: number, sorting?: string): Promise<void> => {
    await DataController.FetchAndSave<PlayerCharacter>(
        {
            url: URLBuilder.ReadFrom('playerCharacter'),
            // If no page or sorting provided, we use default from controller
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            params: !page && !sorting ? null : { page: page!, sorting: sorting! },
            page: 'catalogues',
            key: 'playerCharacters'
        }
    );
};
