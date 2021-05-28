import { PlayerCharacter } from '../interfaces';

import { BaseServiceResponse } from '../../../shared/interfaces';

import { URLBuilder, DataController } from '../../../shared/utils';

export const fetchPlayerCharacters = async (page?: number, sorting?: string): Promise<void> => {
    await DataController.FetchAndSave<PlayerCharacter[]>(
        {
            url: URLBuilder.ReadFrom('playercharacter'),
            // If no page or sorting provided, we use default from controller
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            params: !page && !sorting ? null : { page: page!, sorting: sorting! },
            page: 'catalogues',
            key: 'playerCharacters'
        }
    );
};

export const deletePlayerCharacters = async (ids: number[]): Promise<BaseServiceResponse> => {
    return await DataController.UpdateAndRefetch(
        {
            url: URLBuilder.WriteTo('playercharacter', 'delete'),
            method: 'DELETE',
            body: { ids: ids },
            page: 'catalogues',
            keys: ['playerCharacters']
        }
    );
};
