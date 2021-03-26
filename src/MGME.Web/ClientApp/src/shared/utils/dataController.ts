import { GET, POST } from '../interfaces';
import { get, post } from './requests';

import qs from 'qs';

/*
Client-side controller that manages network requests and application state (via redux store)
*/

export class DataController {
    /*
    Container for urls to refetch after POST request
    Namespaced by page names and data slices
    */
    private static urlsToRefetch: { [key: string]: { [key: string]: string } } = {};

    /**
    Reads data from API, updates the Redux store with new values, saves requested URLs for future refetch
    If request does not need parameters, please provide null

    @param page page to fetch data for
    @param key key under which data will be saved in store
    @param url endpoint
    @param params parameters to encode in URL
    */
    public static async FetchAndSave({ page, key, url, params }: GET): Promise<void> {
        if (params && Object.keys(params).length === 0) {
            throw new Error('Parameters object cannot be empty');
        }

        const urlToRequest = params ? `${url}/?${qs.stringify(params)}` : url;

        const dataset = await get<any>(urlToRequest);

        store.dispatch(
            {
                type: ActionTypes.UPDATE_STORE,
                name: page,
                payload: { [key]: dataset }
            }
        );

        this.urlsToRefetch = { ...this.urlsToRefetch, [page]: { ...this.urlsToRefetch[page], [key]: urlToRequest } };
    }

    /**
    Makes a POST request, refetches data from the API, updates the store with new values

    If you need one or several specific urls to refetch after action,
    please provide array of keys to refetch for, otherwise null

    @param url endpoint
    @param body body of the request
    @param page page to refetch data for after POST request
    @param keys keys in the page under which data will be saved in store
    */
    public static async PostAndRefetch({ url, body, page, keys }: POST): Promise<void> {
        if (keys && keys.length === 0) {
            throw new Error('Keys array cannot be empty');
        }

        await post<any>(url, body);

        if (keys && keys.length > 0) {
            for (const key of keys) {
                const dataset = await get<any>(this.urlsToRefetch[page][key]);

                store.dispatch(
                    {
                        type: ActionTypes.UPDATE_STORE,
                        name: page,
                        payload: { [key]: dataset }
                    }
                );
            }
        }
    }
}
