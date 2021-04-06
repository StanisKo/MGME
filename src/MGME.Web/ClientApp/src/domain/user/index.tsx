import { ReactElement, useEffect, useState } from 'react';
import { User } from './interfaces';

import { getUser } from './requests';

export const UserProfile = (): ReactElement => {
    const [user, setUser] = useState<User>({} as User);

    const gotUser = Object.keys(user).length > 0;

    useEffect(() => {
        (async (): Promise<void> => {
            const userResponse = await getUser();

            if (userResponse.success) {
                setUser(userResponse.data);
            }
        })();
    }, []);

    return gotUser ? (
        <>
            <div>{`Name: ${user.name}`}</div>
            <div>{`Email: ${user.email}`}</div>
        </>
    ) : <div>need auth</div>;
};
