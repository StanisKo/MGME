/*
Since across multiple features we update store in the same way
It only makes sence to have shared actions types...
*/

export interface UpdateStore<TPayload> {
    type: 'UPDATE_STORE';
    reducer: string;
    key: string;
    payload: TPayload;
}

