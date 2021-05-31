/* eslint-disable @typescript-eslint/no-non-null-assertion */

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

    /**
    Reads data from API, updates the Redux store with new values, saves requested URLs for future refetch
    If request does not need parameters, please provide null

    @param url endpoint
    @param params parameters to encode in URL
    @param page page to fetch data for
    @param key key to save data under
    @param returnResponse optional flag that marks if response is saved to store or returned
    */
    public static async FetchAndSave<TResult>(
        { url, params, page, key, returnResponse }: ReadFromApi

    /*
    We still might want to return the response for user-friendly error handling,
    even though we don't anticipate any errors from GET endpoints: it's either there or not
    */
    ): Promise<void | DataServiceResponse<TResult> | PaginatedDataServiceResponse<TResult>> {

        /*
        Grab token for every request,
        since this class doesn't know when token is updated (it is outside of Provider)
        */
        const token = store.getState().auth?.token;

        if (params && Object.keys(params).length === 0) {
            throw new Error('Parameters object cannot be empty. If you don\'t need params, provide null');
        }

        const urlToRequest = params ? `${url}/?${qs.stringify(params)}` : url;

        // This could've been typed with unknown, or even any, since the response object would rarely leave this scope
        const response = await request<DataServiceResponse<TResult> | PaginatedDataServiceResponse<TResult>>(
            {
                url: urlToRequest,
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` }
            }
        );

        if (!response.success || returnResponse) {
            return response;
        }

        const { success, message, ...onlyRelevantValues } = response;

        /*
        At this point, if we don't return response, the caller must have provided page and key
        If not -- that's bad code from the caller :)
        */
        store.dispatch(
            actionCreators.updateStore(
                {
                    type: 'UPDATE_STORE',
                    reducer: page!,
                    key: key!,
                    payload: onlyRelevantValues
                }
            )
        );

        // eslint-disable-next-line max-len
        this._urlsToRefetch = { ...this._urlsToRefetch, [page!]: { ...this._urlsToRefetch[page!], [key!]: urlToRequest } };
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

    Here we always return response, successfull or not, to inform user what's happening
    */
    public static async UpdateAndRefetch({ url, method, body, page, keys }: WriteToApi): Promise<BaseServiceResponse> {

        const token = store.getState().auth?.token;

        if (keys && keys.length === 0) {
            throw new Error('Keys array cannot be empty');
        }

        const response = await request<BaseServiceResponse>(
            {
                url: url,
                method: method,
                body: body,
                headers: { 'Authorization': `Bearer ${token}` }
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
                        headers: { 'Authorization': `Bearer ${token}` }
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
                        headers: { 'Authorization': `Bearer ${token}` }
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
