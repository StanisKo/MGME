/*
Since across multiple features we update store in the same way
It only makes sence to have shared actions creators...
*/

/*
NOTE: We also provide reducer name in order to trigger only that update we need
Also, payload is unknown since we cannot know in advance the shape of response
*/
interface GenericUpdate {
    reducer: string;
    key: string;
    payload: unknown;
}

interface UpdateStore extends GenericUpdate {
    type: 'UPDATE_STORE';
}

interface UpdateRequestParameters extends GenericUpdate {
    type: 'UPDATE_REQUEST_PARAMETERS';
}

export type KnownAction = UpdateStore | UpdateRequestParameters;

export const actionCreators = {
    update: ({ type, reducer, key, payload }: KnownAction): KnownAction => ({
        type: type,
        reducer: reducer,
        key: key,
        payload: payload
    })
};
