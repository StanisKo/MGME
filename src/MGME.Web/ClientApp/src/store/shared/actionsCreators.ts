/*
Since across multiple features we update store in the same way
It only makes sence to have shared actions creators...
*/

interface UpdateStore {
    type: 'UPDATE_STORE';
    payload: {
        data: { [key: string]: unknown }
    }
}

export type KnownAction = UpdateStore;

export const actionCreators = {
    updateStore: ({ type, payload }: UpdateStore): UpdateStore => ({
        type: type,
        payload: { data: payload.data }
    })
};
