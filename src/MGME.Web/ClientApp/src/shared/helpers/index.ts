export enum INPUT_TYPE {
    USERNAME = 0,
    EMAIL = 1,
    PASSWORD = 2,
    REPEAT_PASSWORD = 3
}

// At least 8 chars, 1 upper case and 1 lower case, and 1 digit
export const validPasswordFormat = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/;


// Thank you regexlib: https://regexlib.com/Search.aspx?k=email&c=-1&m=5&ps=10
// eslint-disable-next-line max-len
export const validEmailFormat = /^([a-zA-Z0-9]+(?:[.-]?[a-zA-Z0-9]+)*@[a-zA-Z0-9]+(?:[.-]?[a-zA-Z0-9]+)*\.[a-zA-Z]{2,7})$/;
