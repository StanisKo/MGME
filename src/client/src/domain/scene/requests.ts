import { Scene } from './interfaces';

import {
    BaseServiceResponse,
    DataServiceResponse,
    PaginatedDataServiceResponse,
    ReadFromApi
} from '../../shared/interfaces';

import { URLBuilder, DataController } from '../../shared/utils';

type CreateSceneProps = {
    title: string;
    setup: string;
    adventureId: number;
    adventureChaosFactor?: number;
    randomEvent?: string;
};

export const fetchScenes = async (adventureId: number, page?: number): Promise<void> => {
    const params: ReadFromApi['params'] = {
        adventureId: adventureId
    };

    if (page) {
        params['page'] = page;
    }

    await DataController.FetchAndSave<PaginatedDataServiceResponse<Scene[]>>(
        {
            url: URLBuilder.ReadFrom('scene'),
            params: params,
            page: 'adventureDetail',
            key: 'scenes'
        }
    );
};

export const createScene = async (params: CreateSceneProps): Promise<BaseServiceResponse> => {
    return await DataController.UpdateAndRefetch(
        {
            url: URLBuilder.WriteTo('scene', 'add'),
            method: 'POST',
            body: params,
            page: 'adventureDetail',
            keys: ['scenes']
        }
    );
};

export const requestRandomEvent = async (): Promise<string> => {
    const response = await DataController.FetchAndSave<DataServiceResponse<string>>(
        {
            url: URLBuilder.ReadFrom('randomevent'),
            returnResponse: true
        }
    ) as DataServiceResponse<string>;

    return response.data;
};

export const resolveScene = async (adventureId: number, sceneId: number): Promise<void> => {
    await DataController.UpdateAndRefetch(
        {
            url: URLBuilder.WriteTo('scene', 'resolve'),
            method: 'PUT',
            body: { adventureId, sceneId },
            page: 'adventureDetail',
            keys: ['scenes']
        }
    );
};
