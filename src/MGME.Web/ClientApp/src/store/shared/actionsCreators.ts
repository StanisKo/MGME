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
    payload: { data: unknown };
}

export type KnownAction = UpdateStore;

// Yet, we can make it more specific by providing type from the caller's scope
export const actionCreators = {
    updateStore: <TResult>({ type, reducer, payload }: UpdateStore): UpdateStore => ({
        type: type,
        reducer: reducer,
        payload: { data: payload.data as TResult }
    })
};
