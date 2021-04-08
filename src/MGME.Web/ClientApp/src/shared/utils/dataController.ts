import { BaseServiceResponse, DataServiceResponse, ReadFromApi, WriteToApi } from '../interfaces';

import { request } from './request';

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

    private static token: string = store.getState().auth?.token;

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

    ): Promise<void | DataServiceResponse<TResult>> {

        if (params && Object.keys(params).length === 0) {
            throw new Error('Parameters object cannot be empty. If you don\'t need params, provide null');
        }

        const urlToRequest = params ? `${url}/?${qs.stringify(params)}` : url;

        const response = await request<DataServiceResponse<TResult>>(
            {
                url: urlToRequest,
                method: 'GET',
                headers: { 'Authorization': `Bearer ${this.token}` }
            }
        );

        if (!response.success) {
            return response;
        }

        store.dispatch(
            actionCreators.updateStore(
                {
                    type: 'UPDATE_STORE',
                    reducer: page,
                    payload: { data: response.data }
                }
            )
        );

        this.urlsToRefetch = { ...this.urlsToRefetch, [page]: { ...this.urlsToRefetch[page], [key]: urlToRequest } };
    }

    /**
    Makes a POST/PUT/DELETE request, refetches data from the API, updates the store with new values
    
    By default, refetches all urls saved for this page
    If you only need one or several specific urls, please provide array of keys to refetch for, otherwise null
    
    @param url endpoint
    @param method http method
    @param body body of the request
    @param page page to refetch data for after request
    @param keys keys in the page under which data will be saved in store
    */
    public static async UpdateAndRefetch(
        { url, method, body, page, keys }: WriteToApi

    ): Promise<void | BaseServiceResponse> {

        if (keys && keys.length === 0) {
            throw new Error('Keys array cannot be empty');
        }

        const response = await request<BaseServiceResponse>(
            {
                url: url,
                method: method,
                body: body,
                headers: { 'Authorization': `Bearer ${this.token}` }
            }
        );

        if (!response.success) {
            return response;
        }

        if (keys && keys.length > 0) {
            for (const key of keys) {
                /*
                We type data service response with unknown, since we don't know in advance which endpoints
                We would like to refetch after update
                */
                const response = await request<DataServiceResponse<unknown>>(
                    {
                        url: this.urlsToRefetch[page][key],
                        method: 'GET',
                        headers: { 'Authorization': `Bearer ${this.token}` }
                    }
                );

                store.dispatch(
                    actionCreators.updateStore(
                        {
                            type: 'UPDATE_STORE',
                            reducer: page,
                            payload: { data: response.data }
                        }
                    )
                );
            }
        }
        else {
            const urls = Object.keys(this.urlsToRefetch[page]);

            for (const key of urls) {
                const response = await request<DataServiceResponse<unknown>>(
                    {
                        url: this.urlsToRefetch[page][key],
                        method: 'GET',
                        headers: { 'Authorization': `Bearer ${this.token}` }
                    }
                );

                store.dispatch(
                    actionCreators.updateStore(
                        {
                            type: 'UPDATE_STORE',
                            reducer: page,
                            payload: { data: response.data }
                        }
                    )
                );
            }
        }
    }
}
