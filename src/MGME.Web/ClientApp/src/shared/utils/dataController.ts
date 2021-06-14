/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { BaseServiceResponse, ReadFromApi, WriteToApi } from '../interfaces';

import { request } from './request';

import { store, UpdateStore } from '../../store';

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
    We either save data into store and return nothing,
    Or return structure specified by the caller (or error, if any)
    */
    ): Promise<void | TResult | Error> {

        /*
        Grab token for every request,
        since this class doesn't know when token is updated (it is outside of Provider)
        */
        const token = store.getState().auth?.token;

        if (params && Object.keys(params).length === 0) {
            throw new Error(
                'Parameters object cannot be empty. If you don\'t need params, omit the argument'
            );
        }

        const urlToRequest = params ? `${url}/?${qs.stringify(params)}` : url;

        const response = await request<TResult>(
            {
                url: urlToRequest,
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` }
            }
        );

        if (returnResponse || response instanceof(Error)) {
            return response;
        }

        /*
        At this point, if we don't return response and there is no error
        the caller must have provided page and key
        */
        if (!page || !key) {
            throw new Error(
                'You need page and key to save to store'
            );
        }

        store.dispatch<UpdateStore<TResult>>(
            {
                type: 'UPDATE_STORE',
                reducer: page,
                key: key,
                payload: response
            }
        );

        this._urlsToRefetch = { ...this._urlsToRefetch, [page]: { ...this._urlsToRefetch[page], [key]: urlToRequest } };
    }

    /**
    Makes a POST/PUT/DELETE request, refetches data from the API, updates the store with new values

    @param url endpoint
    @param method http method
    @param body body of the request
    @param page page to refetch data for after request
    @param keys keys in the page under which data will be saved in store

    Here we always return response, successfull or not, to inform user what's happening
    */
    public static async UpdateAndRefetch(
        { url, method, body, page, keys }: WriteToApi): Promise<BaseServiceResponse | Error> {

        const token = store.getState().auth?.token;

        if (keys && keys.length === 0) {
            throw new Error(
                'Keys array cannot be empty. If you want to refetch all URLs for this page, omit the argument'
            );
        }

        const response = await request<BaseServiceResponse>(
            {
                url: url,
                method: method,
                body: body,
                headers: { 'Authorization': `Bearer ${token}` }
            }
        );

        if (response instanceof(Error)) {
            return response;
        }

        // We received keys ? Refetch all urls by that keys : refetch all urls for that page
        const keysToRefetch = keys && keys.length ? keys : Object.keys(this._urlsToRefetch[page]);

        const requests = keysToRefetch.map(key => {

            // Dispatch all requests
            return request<unknown>(
                {
                    url: this._urlsToRefetch[page][key],
                    method: 'GET',
                    headers: { 'Authorization': `Bearer ${token}` }
                }
            );
        });

        /*
        Wait for all responses
        In such way, script can proceed to creating new requests before the results of previous are received
        */
        const responses = await Promise.all(requests);

        // We finally save all fresh responses by the same keys
        for (let i = 0; i < responses.length; i++) {

            store.dispatch<UpdateStore<unknown>>(
                {
                    type: 'UPDATE_STORE',
                    reducer: page,
                    key: keysToRefetch[i],
                    payload: responses[i]
                }
            );
        }

        return response;
    }
}
