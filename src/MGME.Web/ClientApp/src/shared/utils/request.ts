import { RequestConfig } from '../interfaces';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const request = async <TResult>({ url, method, headers, body }: RequestConfig): Promise<TResult | any> => {
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
        return error;
    }
};


