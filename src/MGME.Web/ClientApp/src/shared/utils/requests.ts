// Generalized http function to serve the need of various request methods
const http = async <T>(request: RequestInfo): Promise<T> => {
    try {
        const response = await fetch(request);

        const parsedResponse = await response.json();

        return parsedResponse;
    }
    catch (error) {
        return error;
    }
};

export const read = async <T>(url: string): Promise<T> => {
    const args: RequestInit = { method: 'GET' };

    return await http<T>(new Request(url, args));
};

export const write = async <T>(
    url: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    body: { [key: string]: unknown },
    headers?: { [key: string]: string }): Promise<T> => {
    const args: RequestInit = { method: method, body: JSON.stringify(body), headers: headers };

    return await http<T>(new Request(url, args));
};


