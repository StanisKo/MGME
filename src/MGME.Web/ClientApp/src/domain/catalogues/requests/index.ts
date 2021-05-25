import { PlayerCharacter } from '../interfaces';
import { URLBuilder, DataController } from '../../../shared/utils';

export const fetchPlayerCharacters = async (page: number, sorting: string): Promise<void> => {
    await DataController.FetchAndSave<PlayerCharacter>(
        {
            url: URLBuilder.ReadFrom('playerCharacter'),
            params: {
                page: page,
                sorting: sorting
            },
            page: 'catalogues',
            key: 'playerCharacters'
        }
    );
};
