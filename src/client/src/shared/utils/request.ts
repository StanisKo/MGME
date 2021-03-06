import { RequestConfig } from '../interfaces';

export const request = async <TResult>({ url, method, headers, body }: RequestConfig): Promise<TResult> => {
    const args: RequestInit = {
        method: method,
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            ...headers
        },
        ...(body? { body: JSON.stringify(body) } : null)
    };

    try {
        const response = await fetch(new Request(url, args));

        const parsedResponse = await response.json();

        return parsedResponse;
    }
    catch (error) {
        // We log the error and return empty dict into the scope to not break the UI
        console.log(error);

        return {} as TResult;
    }
};


