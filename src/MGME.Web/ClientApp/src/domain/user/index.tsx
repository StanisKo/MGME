import { ReactElement, useEffect, useState } from 'react';
import { GetUserDTO } from './interfaces';

import { getUser } from './requests';

export const UserCabinet = (): ReactElement => {
    const [user, setUser] = useState<GetUserDTO>({} as GetUserDTO);

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
