import { RequestConfig } from '../interfaces';

const http = async <TResult>(request: RequestInfo): Promise<TResult> => {
    try {
        const response = await fetch(request);

        const parsedResponse = await response.json();

        return parsedResponse;
    }
    catch (error) {
        return error;
    }
};

export const makeRequest = async <TResult>({ url, method, headers, body }: RequestConfig): Promise<TResult> => {
    const args: RequestInit = {
        method: method,
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            ...headers
        },
        ...(body? { body: JSON.stringify(body) } : null)
    };

    return await http<TResult>(new Request(url, args));
};


