export enum MODE {
    SIGN_UP = 0,
    SIGN_IN = 1
}

export enum INPUT_TYPE {
    USERNAME = 0,
    EMAIL = 1,
    PASSWORD = 2
}

export const modeNames = ['Sign Up', 'Sign In'];

export const validEmailFormat = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

// At least 8 chars, 1 upper case and 1 lower case, and 1 digit
export const validPasswordFormat = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/;
