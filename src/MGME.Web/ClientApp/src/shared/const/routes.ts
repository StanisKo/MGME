const root = '/';

/*
Rename login into signin

Remove logout, since logout would imply removing the token from sessionStorage
*/

export const ROUTES = {
    ROOT: `${root}`,
    LOGIN: `${root}login`,
    LOGOUT: `${root}logout`,
    START: `${root}start`
};
