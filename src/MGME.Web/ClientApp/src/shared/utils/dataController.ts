import { BaseServiceResponse, DataServiceResponse, ReadFromApi, WriteToApi } from '../interfaces';

import { makeRequest } from './makeRequest';

import { store } from '../../store/configureStore';
import { actionCreators } from '../../store/shared';

import qs from 'qs';

/*
Client-side controller that manages network requests and application state via redux store
*/

export class DataController {
    /*
    Container for urls to refetch after POST/PUT/DELETE requests
    Namespaced by page (reducer) and different datasets (keys)
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
    public static async FetchAndSave<TResult>(
        { page, key, url, params }: ReadFromApi

    ): Promise<void | BaseServiceResponse | DataServiceResponse<TResult>> {

        if (params && Object.keys(params).length === 0) {
            throw new Error('Parameters object cannot be empty. If you don\'t need params, provide null');
        }

        const urlToRequest = params ? `${url}/?${qs.stringify(params)}` : url;

        const response = await makeRequest<BaseServiceResponse | DataServiceResponse<TResult>>(
            {
                url: urlToRequest,
                method: 'GET',
                headers: null
            }
        );

        if (!response.success) {
            return response;
        }

        const data = (response as DataServiceResponse<TResult>).data;

        store.dispatch(
            actionCreators.updateStore(
                {
                    type: 'UPDATE_STORE',
                    reducer: page,
                    payload: { data }
                }
            )
        );

        this.urlsToRefetch = { ...this.urlsToRefetch, [page]: { ...this.urlsToRefetch[page], [key]: urlToRequest } };
    }

    /**
    Makes a POST request, refetches data from the API, updates the store with new values
    
    By default, refetches all urls saved for this page
    If you only need one or several specific urls, please provide array of keys to refetch for, otherwise null
    
    @param url endpoint
    @param body body of the request
    @param page page to refetch data for after POST request
    @param keys keys in the page under which data will be saved in store
    */
    public static async PostAndRefetch({ url, body, page, keys }: WriteToApi): Promise<void>
    {
        if (keys && keys.length === 0)
        {
            throw new Error('Keys array cannot be empty');
        }

        await post<any>
        (
            url,
            body,
            { 'X-CSRFToken': this.token }
        );

        if (keys && keys.length > 0)
        {
            for (const key of keys)
            {
                const dataset = await get<any>(this.urlsToRefetch[page][key]);

                store.dispatch
                (
                    {
                        type: ActionTypes.UPDATE_STORE,
                        name: page,
                        payload: { [key]: dataset },
                    },
                );
            }
        }
        else
        {
            const urls = Object.keys(this.urlsToRefetch[page]);

            for (const key of urls)
            {
                const dataset = await get<any>(this.urlsToRefetch[page][key]);
    
                store.dispatch
                (
                    {
                        type: ActionTypes.UPDATE_STORE,
                        name: page,
                        payload: { [key]: dataset },
                    },
                );
            }
        }
    }
}