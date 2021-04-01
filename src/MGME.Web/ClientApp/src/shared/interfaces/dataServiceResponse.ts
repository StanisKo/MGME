import { BaseServiceResponse } from './baseServiceResponse';

export interface DataServiceResponse<TResult> extends BaseServiceResponse {
    data: TResult;
}
