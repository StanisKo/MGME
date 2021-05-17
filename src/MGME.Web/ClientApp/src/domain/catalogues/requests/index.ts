import { PlayerCharacter } from '../interfaces';
import { URLBuilder, DataController } from '../../../shared/utils';
// import { BaseServiceResponse } from '../../../shared/interfaces';

export const fetchPlayerCharacters = async (): Promise<void> => {
    await DataController.FetchAndSave<PlayerCharacter>(
        {
            url: URLBuilder.ReadFrom('playerCharacter'),
            params: null,
            page: 'catalogues',
            key: 'playerCharacters'
        }
    );
};
