import { history } from './utils';

// At least 8 chars, 1 upper case and 1 lower case, and 1 digit
export const validPasswordFormat = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/;

// Thank you regexlib: https://regexlib.com/Search.aspx?k=email&c=-1&m=5&ps=10
// eslint-disable-next-line max-len
export const validEmailFormat = /^([a-zA-Z0-9]+(?:[.-]?[a-zA-Z0-9]+)*@[a-zA-Z0-9]+(?:[.-]?[a-zA-Z0-9]+)*\.[a-zA-Z]{2,7})$/;

// Check if item is present in collection
export const isSelected = (id: number, source: number[]): boolean => source.includes(id);

// Parse entity id from accessed route
export const parseIDFromURL = (): number => {

    return Number(
        window.location.pathname.replace(/v(\d+)\//, '').match(/(\d+)/g)
    );
};

// Curry it, since we are using it as a handler
export const redirectToEntity = (entity: string, id: number) => (): void => {
    history.push(`/${entity}/${id}`);
};
