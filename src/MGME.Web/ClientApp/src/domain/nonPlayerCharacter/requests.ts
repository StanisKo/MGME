// import { NonPlayerCharacter } from './interfaces';

// import { PaginatedDataServiceResponse } from '../../shared/interfaces';

// import { URLBuilder, DataController } from '../../shared/utils';

// export const fetchNonPlayerCharacters = async (page?: number, sorting?: string): Promise<void> => {
//     const params: ReadFromApi['params'] = {};

//     if (page) {
//         params['page'] = page;
//     }

//     if (sorting) {
//         params['sorting'] = sorting;
//     }

//     await DataController.FetchAndSave<NonPlayerCharacter[]>(
//         {
//             url: URLBuilder.ReadFrom('playercharacter'),
//             ...(Object.keys(params).length > 0 ? { params: { ...params } } : null),
//             page: 'catalogues',
//             key: 'playerCharacters'
//         }
//     );
// };
