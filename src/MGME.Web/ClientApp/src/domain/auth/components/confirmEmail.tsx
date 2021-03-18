import { ReactElement } from 'react';

import qs from 'qs';

export const ConfirmEmail = (): ReactElement => {
    const token = qs.parse(window.location.search, { ignoreQueryPrefix: true })?.token;

    console.log(token);

    return <div>Thank you for confirming email address</div>;
};
