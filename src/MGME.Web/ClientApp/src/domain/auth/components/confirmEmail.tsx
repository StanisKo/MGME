import { ReactElement } from 'react';

import { confirmEmailAddress } from '../requests';

import qs from 'qs';

export const ConfirmEmail = (): ReactElement => {
    const token = qs.parse(window.location.search, { ignoreQueryPrefix: true })?.token;

    if (token) {
        confirmEmailAddress(token as string);
    }

    return <div>Thank you for confirming email address</div>;
};
