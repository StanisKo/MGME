/*
Since across multiple features we update store in the same way
It only makes sence to have shared actions creators...
*/

/*
NOTE: We also provide reducer name in order to trigger only that update we need
Also, data key is unknown since we cannot know in advance the shape of response
*/
interface UpdateStore {
    type: 'UPDATE_STORE';
    reducer: string;
    key: string;
    payload: { data: unknown };
}

export type KnownAction = UpdateStore;

export const actionCreators = {
    updateStore: ({ type, reducer, key, payload }: UpdateStore): UpdateStore => ({
        type: type,
        reducer: reducer,
        key: key,
        payload: { data: payload.data }
    })
};
