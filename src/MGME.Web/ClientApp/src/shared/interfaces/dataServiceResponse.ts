export interface DataServiceResponse<TResult> {
    data: TResult;
    success: boolean;
    message: string;
}
