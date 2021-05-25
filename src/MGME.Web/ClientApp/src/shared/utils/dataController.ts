import {
    BaseServiceResponse,
    DataServiceResponse,
    PaginatedDataServiceResponse,
    ReadFromApi,
    WriteToApi
} from '../interfaces';

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
    Namespaced by page (reducer) and dataset (key)
    */
    private static _urlsToRefetch: { [key: string]: { [key: string]: string } } = {};

    private static _token: string;

    /**
    Reads data from API, updates the Redux store with new values, saves requested URLs for future refetch
    If request does not need parameters, please provide null

    @param page page to fetch data for
    @param key key to save data under
    @param url endpoint
    @param params parameters to encode in URL
    */
    public static async FetchAndSave<TResult>(
        { page, key, url, params }: ReadFromApi

    ): Promise<void | DataServiceResponse<TResult> | PaginatedDataServiceResponse<TResult>> {

        // Check if we got token, otherwise take it
        if (!this._token) {
            this._token = store.getState().auth?.token;
        }

        if (params && Object.keys(params).length === 0) {
            throw new Error('Parameters object cannot be empty. If you don\'t need params, provide null');
        }

        const urlToRequest = params ? `${url}/?${qs.stringify(params)}` : url;

        const response = await request<DataServiceResponse<TResult> | PaginatedDataServiceResponse<TResult>>(
            {
                url: urlToRequest,
                method: 'GET',
                headers: { 'Authorization': `Bearer ${this._token}` }
            }
        );

        if (!response.success) {
            return response;
        }

        const { success, message, ...onlyRelevantValues } = response;

        store.dispatch(
            actionCreators.updateStore(
                {
                    type: 'UPDATE_STORE',
                    reducer: page,
                    key: key,
                    payload: onlyRelevantValues
                }
            )
        );

        this._urlsToRefetch = { ...this._urlsToRefetch, [page]: { ...this._urlsToRefetch[page], [key]: urlToRequest } };
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

        if (!this._token) {
            this._token = store.getState().auth?.token;
        }

        if (keys && keys.length === 0) {
            throw new Error('Keys array cannot be empty');
        }

        const response = await request<BaseServiceResponse>(
            {
                url: url,
                method: method,
                body: body,
                headers: { 'Authorization': `Bearer ${this._token}` }
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
                const response = await request<DataServiceResponse<unknown> | PaginatedDataServiceResponse<unknown>>(
                    {
                        url: this._urlsToRefetch[page][key],
                        method: 'GET',
                        headers: { 'Authorization': `Bearer ${this._token}` }
                    }
                );

                const { success, message, ...onlyRelevantValues } = response;

                store.dispatch(
                    actionCreators.updateStore(
                        {
                            type: 'UPDATE_STORE',
                            reducer: page,
                            key: key,
                            payload: onlyRelevantValues
                        }
                    )
                );
            }
        }
        else {
            const urls = Object.keys(this._urlsToRefetch[page]);

            for (const key of urls) {
                const response = await request<DataServiceResponse<unknown> | PaginatedDataServiceResponse<unknown>>(
                    {
                        url: this._urlsToRefetch[page][key],
                        method: 'GET',
                        headers: { 'Authorization': `Bearer ${this._token}` }
                    }
                );

                const { success, message, ...onlyRelevantValues } = response;

                store.dispatch(
                    actionCreators.updateStore(
                        {
                            type: 'UPDATE_STORE',
                            reducer: page,
                            key: key,
                            payload: onlyRelevantValues
                        }
                    )
                );
            }
        }

        return response;
    }
}
