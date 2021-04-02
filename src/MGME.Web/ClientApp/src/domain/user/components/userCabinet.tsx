import { ReactElement, useEffect, useState } from 'react';
import { GetUserDTO } from '../interfaces';

import { getUser } from '../requests';

export const UserCabinet = (): ReactElement => {
    const [user, setUser] = useState<GetUserDTO>({} as GetUserDTO);

    useEffect(() => {
        (async (): Promise<void> => {
            const userResponse = await getUser();

            if (userResponse.success) {
                setUser(userResponse.data);
            }
        })();
    }, []);

    return Object.keys(user).length > 0 ? (
        <>
            <div>{`Name: ${user.name}`}</div>
            <div>{`Email: ${user.email}`}</div>
        </>
    ) : <div>need auth</div>;
};
