// Generalized http function to serve the need of various request methods
const http = async <T>(request: RequestInfo): Promise<T> =>
{
    try {
        const response = await fetch(request);

        const parsedResponse = await response.json();

        return parsedResponse;
    }
    catch (error) {
        return error;
    }
};

// Implementation of HTTP requests by method: GET, POST, PUT.
export const get = async <T>(url: string): Promise<T> => {
    const args: RequestInit = { method: 'GET' };

    return await http<T>(new Request(url, args));
};

export const post = async <T>(
    url: string, body: { [key: string]: unknown }, headers?: { [key: string]: string }
): Promise<T> => {
    const args: RequestInit = { method: 'POST', body: JSON.stringify(body), headers: headers };

    return await http<T>(new Request(url, args));
};

export const put = async <T>(
    url: string, body: { [key: string]: unknown }, headers?: Record<string, string>): Promise<T> => {
    const args: RequestInit = { method: 'PUT', body: JSON.stringify(body), headers: headers };

    return await http<T>(new Request(url, args));
};

