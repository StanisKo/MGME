export interface RequestConfig {
    url: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    headers: { [key: string]: string } | null,
    body?: { [key: string]: unknown }
}
